// #region Imports ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
import Lazy from 'vanilla-lazyload';
import * as M from 'materialize-css';
import Swiper, { Pagination, Autoplay, Controller, Navigation } from 'swiper';
import noUiSlider from 'nouislider';
import Zoomer from './lib/zoomer';
Swiper.use([Pagination, Autoplay, Controller, Navigation]);
import Mask from 'imask';
// #endregion

// #region MaterializeCSS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
let lazy = new Lazy({}, document.querySelectorAll('.lazy'));
let sidenav = document.querySelectorAll('.sidenav').length ? M.Sidenav.init(document.querySelectorAll('.sidenav')) : null;
let modal = document.querySelectorAll('.modal').length ? M.Modal.init(document.querySelectorAll('.modal')) : null;
let tabs = document.querySelectorAll('.tabs').length ? M.Tabs.init(document.querySelectorAll('.tabs')) : null;
let tooltips = document.querySelectorAll('.tooltipped').length ? M.Tooltip.init(document.querySelectorAll('.tooltipped')) : null;

//Получаем завтрашнюю дату
var current_date = new Date();
var tommorow = current_date.setDate(current_date.getDate() + 1);

let datePicker = M.Datepicker.init(document.querySelectorAll('.datepicker'), {
    firstDay: 1,
    autoClose: true,
    minDate: new Date(tommorow),
	format: 'dd mmmm yyyy',
    onSelect: loadIntervals,
	i18n: {
		done: 'OK',
		clear: 'Очистить',
		cancel: 'Отмена',
		weekdays: ['Воскресенье', 'Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
		weekdaysAbbrev: ['вс','пн','вт','ср','чт','пт','сб'],
		weekdaysShort: ['вс','пн','вт','ср','чт','пт','сб'],
		months: [
			'Январь',
			'Февраль',
			'Март',
			'Апрель',
			'Май',
			'Июнь',
			'Июль',
			'Август',
			'Сентябрь',
			'Октябрь',
			'Ноябрь',
			'Декабрь',
		],
		monthsShort:['Янв','Фвр','Мрт','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
	},
	onClose: () => {
		$('#delivery-time').addClass('visible');
	}
});

//= Загрузка диапазонов ===================================================
function loadIntervals(date){
    $('input[name="delivery_date_timestamp"]').val(date.getTime()/1000);
	let url = $('#delivery-date').data('url');
	debugger;
    $.ajax({
        url: url,
        type: "POST",
        dataType: "JSON",
        data: {
            delivery_date: date.getTime()/1000
        },
        success: (res) => {
            console.log(res);
            $('input[name="delivery_date"]').val(res.formatted_date);
            let emptyLi = `<li><a class="waves-effect" data-value="undefined">Любой</a></li>`;
            $('#interval-wrapper').empty().append(emptyLi);
            for(var key in res.intervals){
                let li = `<li><a data-value="${res.intervals[key]}" class="waves-effect">${res.intervals[key]}</a></li>`
                $('#interval-wrapper').append(li);
            }
            $('#delivery-interval').removeClass('hidden');
            $('#interval-0').prop('checked', 'checked');
        },
        error: (err) => {
            console.error(err)
        }
    });
}

let zoomer = new Zoomer('.zoomer', 'src', true);

document.querySelectorAll('input[type="tel"]').forEach((el:HTMLInputElement) => {
	Mask(el, {
		mask: '{+7} (000) 000 00-00'
	});
});

(window as any).lazy = Lazy;
// #endregion

// #region Инициализация слайдра цен
let noUiInit = () => {

	let createRange = (id:string) => {
	
		let sliderElement = document.getElementById(id);
		let container = sliderElement.parentElement;
		let range = <HTMLElement>container.querySelector('.input-range');
		let max = parseInt(range.dataset['max']);
		let minElement = <HTMLInputElement>container.querySelector('.min');
		let maxElement = <HTMLInputElement>container.querySelector('.max');
		let calibrationElement = <HTMLSpanElement>container.querySelector('.calibration');
	
		minElement.value = "0";
		maxElement.value = max.toString();
	
		let updateWidth = (e:InputEvent, handleElement:HTMLInputElement = null, setValue:boolean = true) => {
	
			// Обновляем ширину
			let element = handleElement ? handleElement : <HTMLInputElement>e.currentTarget;
			calibrationElement.textContent = element.value;
			let width = (calibrationElement.clientWidth + 10) + "px";
			element.style.width = width;
	
			// Обновляем значение
			let values = [parseInt(minElement.value), parseInt(maxElement.value)];
	
			if(setValue){
				(sliderElement as any).noUiSlider.set(values);
			}
		}
	
		minElement.addEventListener("input", updateWidth);
		maxElement.addEventListener("input", updateWidth);
	
		noUiSlider.create(sliderElement, {
			start: [0, max],
			step: 1,
			behaviour: 'drag-smooth-steps-tap',
			range: {
				min: 0,
				max: max
			},
			connect: true,
			format: {
				from: value => {
					return parseInt(value);
				},
				to: value => {
					return parseInt(value as any);
				},
			}
		});
	
		(sliderElement as any).noUiSlider.on('slide', (values:Array<number>) => {
			let min = values[0];
			let max = values[1];
			minElement.value = min.toString();
			maxElement.value = max.toString();
			updateWidth(null, minElement, false);
			updateWidth(null, maxElement, false);
		});
	
		(sliderElement as any).noUiSlider.on('end', (values:Array<number>) => {
			// Устанавливаем значения скрытых инпутов
			console.log("Завершение установки диапазона цен")
		});

		$(window).on('resize', () => {
			updateWidth(null, minElement, false);
			updateWidth(null, maxElement, false);
		});

		updateWidth(null, minElement, false);
		updateWidth(null, maxElement, false);
	}

	// Форма для десктопа
	createRange('price-range-desktop');
	
	// Форма для мобильника
	createRange('price-range-mobile');

	// Синхронизация слайдеров
	let sliderDesktopElement = document.getElementById('price-range-desktop');
	let sliderMobileElement = document.getElementById('price-range-mobile');
	let sliderDesktop = (sliderDesktopElement as any).noUiSlider;
	let sliderMobile = (sliderMobileElement as any).noUiSlider;

	let syncValues = (targetDevice:string, values:Array<number>) => {
		let slider = targetDevice == "mobile" ? sliderMobile : sliderDesktop;
		let sliderElement = targetDevice == "mobile" ? sliderMobileElement : sliderDesktopElement;
		
		slider.set(values);

		let container = sliderElement?.parentElement;
		let calibrationElement = <HTMLSpanElement>container.querySelector('.calibration');
		let minInputElement = <HTMLInputElement>container?.querySelector('.min');
		let maxInputElement = <HTMLInputElement>container?.querySelector('.max');

		minInputElement.value = values[0].toString();
		calibrationElement.textContent = minInputElement.value;
		let width = (calibrationElement.clientWidth + 10) + "px";
		minInputElement.style.width = width;

		maxInputElement.value = values[1].toString();
		calibrationElement.textContent = maxInputElement.value;
		width = (calibrationElement.clientWidth + 10) + "px";
		maxInputElement.style.width = width;

	}

	sliderDesktop.on("slide", (value:any) => {
		syncValues('mobile', value);
	});

	sliderMobile.on("slide", (value:any) => {
		syncValues('desktop', value);
	});
	
}

// if($('#price-range-desktop').length){ noUiInit(); }

if($('[name=address]').length){
	let el = <HTMLElement>document.querySelector('[name=address]');
	$('[name=city]').val(el.dataset['city']);
	$('[name=street]').val(el.dataset['street']);
	$('[name=house]').val(el.dataset['house']);
	$('[name=block]').val(el.dataset['block']);
	$('[name=app]').val(el.dataset['app']);
	$('[name=entrance]').val(el.dataset['entrance']);
	$('[name=floor]').val(el.dataset['floor']);
	$('[name=domofon]').val(el.dataset['domofon']);
}
// #endregion


(() => {

	let productCardSlider = new Swiper('.productcard-slider', {
		pagination: {
			el: '.swiper-pagination',
			type: 'bullets',
			clickable: true,
		},
		loop: true
	})
})();


// #region Работа с картой ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// Инициализация
declare var ymaps:any;
let map:any;

if($('#map').length){

	loadScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU', () => {
		ymaps.ready(() => {

			let firstAddressEntry = $('.address-entry').get(0);
			let coords = firstAddressEntry?.dataset;
			let lon = parseFloat(coords.lon);
			let lat = parseFloat(coords.lat);
			let zoom = parseInt(coords.zoom);
			let center = [lat, lon];
			
			map = new ymaps.Map('map', {
				center: center,
				zoom: zoom,
				controls: ['smallMapDefaultSet']
			});
		
			map.behaviors.disable('scrollZoom');
		
			$(".address-entry").each((index, el) => {
				let coords = el?.dataset;
				let lon = parseFloat(coords.lon);
				let lat = parseFloat(coords.lat);
				let placemark = new ymaps.Placemark( [lat, lon], {}, {iconColor: 'red'});
				map.geoObjects.add(placemark);
			});

			firstAddressEntry?.classList.add('active');
		})
	})

}

if($('#contacts-map').length)
{
	loadScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU', () => {
		ymaps.ready(() => {


			let lon = 39.020000;
			let lat = 45.032608;
			let zoom = 11;
			let center = [lat, lon];
			
			map = new ymaps.Map('contacts-map', {
				center: center,
				zoom: zoom,
				controls: ['smallMapDefaultSet']
			});
		
			map.behaviors.disable('scrollZoom');
			let pointsDom = document.querySelectorAll('.address');

			pointsDom.forEach(el => {
				let element = <HTMLElement>el;
				let lon = element.dataset['lon'];
				let lat = element.dataset['lat'];

				if(lon && lat){
					let coords = [parseFloat(lat), parseFloat(lon)];
					let placemark = new ymaps.Placemark(coords);
					map.geoObjects.add(placemark);

					placemark.events.add('click', (p) => {
						let coordinates = p.originalEvent.target.geometry.getCoordinates();
						let lon = coordinates[0];
						let lat = coordinates[1];
						let url = `https://yandex.ru/maps/35/krasnodar/?ll=${lat}%2C${lon}&mode=routes&rtext=~${lon}%2C${lat}&rtt=auto&ruri=~&z=14`
						window.open(url, '_blank');
					})
				}
			})
		})
	})
}

// Переход по клику
$('body').on('click', '.address-entry', (e:JQuery.ClickEvent) => {

	if(window.innerWidth >= 900){
		let el = e.currentTarget;
		let coords = el.dataset;
		let lon = parseFloat(coords.lon);
		let lat = parseFloat(coords.lat);
		let zoom = parseInt(coords.zoom);
	
		$('.address-entry').removeClass('active');
		$(el).addClass('active');
	
		map.setCenter([lat, lon], zoom, {
			checkZoomRange: true,
			duration: 400,
			timingFunction: 'ease-in-out'
		});
	}
});

// #endregion

// #region Обработчики событий::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Инициализация печати модального окна
window.addEventListener('beforeprint', () => {
	if(document.querySelectorAll('.zoomer-wrapper').length){
		document.body.classList.add('print-modal');
	}
});

window.addEventListener('afterprint', () => {
	document.body.classList.remove('print-modal');
})

// Отображение прикрепляемого файла
$('body').on('change', 'input[type="file"]', (e:JQuery.ChangeEvent) => {
	let count = e.currentTarget.files.length;
	let label = <HTMLLabelElement>e.currentTarget.parentElement.querySelector('label');
	label.textContent = `Вложения (${count})`;
})

$('body').on('click', '.disclaimer-toggle', (e:JQuery.ClickEvent) => {
	e.preventDefault();
	let $content = $(e.currentTarget).parents('.disclaimer').find('.disclaimer-content');
	let current = $content.css('display');
	let $button = $(e.currentTarget);
	$content.css({
		display: current == '-webkit-box' ? 'block' : '-webkit-box'
	});

	$button.text(current != 'block' ? '« Меньше' : 'Больше »');
})

$('body').on('input', '.password-validate', (e:JQuery.ChangeEvent) => {

	let val1 = $('#specimen1').val()?.toString();
	let val2 = $('#specimen2').val()?.toString();

	let success = 0;

	let hasNumbers = /[0-9]/.test(val1); 								//Содержит цифры
	let length = /^.{8,32}$/.test(val1); 								//Длинна от 8 до 32 знаков
	let cases = /[a-z]/.test(val1) && /[A-Z]/.test(val1) 				//Содержит верхний и нижний регистр
	let special = /[●!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(val1)	// Содержит спец.символы
	let equal = val1 === val2 && val1 != '';							// Пароли совпадают

	success += hasNumbers ? 1 : 0;
	success += length ? 1 : 0;
	success += cases ? 1 : 0;
	success += special ? 1 : 0;

	$('#containCases').attr('class', cases ? 'condition valid' : 'condition');
	$('#containNumbers').attr('class', hasNumbers ? 'condition valid' : 'condition');
	$('#containSpecial').attr('class', special ? 'condition valid' : 'condition');
	$('#validLength').attr('class', length ? 'condition valid' : 'condition');
	
	let percent = success / 4 * 100
	
	$('.complexity-val').css({
		width: percent + '%'
	})

	let className = "";
	let messages = ['', 'Слишком простой', 'Средний', 'Надёжный'];
	let index = 0;

	switch(true){
		case success == 0 : index = 0; className = ''; break;
		case success == 1 : index = 1; className = "low" ; break;
		case success < 4 : index = 2; className = "med" ; break;
		case success >= 4 : index = 3; className = "high"; break;
	}
	
	$('#passwordsEqual').attr('class', equal ? 'condition valid' : 'condition');
	$('.complexity-val').attr('class', 'complexity-val ' + className);
	$('#complexity-label').text(messages[index]);
})

// Переключение типа аккаунта в модальном окне
$('body').on('change', '[name="account-type"]', (e:JQuery.ChangeEvent) => {
	let val = (<HTMLInputElement>e.currentTarget).value;
	$('#fieldset').attr('data-mode', val);
});

// Отображение поля изменения пароля в редакторе профиля
$('body').on('change', '#change-password', (e:JQuery.ChangeEvent) => {
	let el = <HTMLInputElement>e.currentTarget;
	let checked = el.checked;

	if(checked){
		$('#password').slideDown('fast');
	}else{
		$('#password').slideUp('fast');
	}
})

// #region Обработка Smart bttn
$('body').on('click', '.smart-bttn a.mdi', (e:JQuery.ClickEvent) => {
	e.preventDefault();
	let $element = $(e.currentTarget);
	let direction = $element.hasClass('mdi-minus') ? -1 : 1;
	let $parent = $element.parents('.smart-bttn');
	let $input = $parent.find('[type=number]');
	let value = parseInt($input.val()?.toString()) + direction;
	if(value >= 0){
		$input.val(value);
	}
	if(value == 0){
		$parent.removeClass('flip');
	}
});

$('body').on('click', '.smart-bttn .cart-bttn', (e:JQuery.ClickEvent) => {
	e.preventDefault();
	let $element = $(e.currentTarget);
	let $parent = $element.parents('.smart-bttn');
	let $input = $parent.find('[type=number]');
	$input.val(1);
	$parent.addClass('flip');
});
// #endregion

// #region Раскрывающийся список
$('body').on('click', '.input-field', (e:JQuery.ClickEvent) => {
	let el = e.currentTarget;
	$(el).addClass('hover');
})

$('body').on('click', '.input-field li a', (e:JQuery.ClickEvent) => {
	e.preventDefault();
	let el = <HTMLLinkElement>e.currentTarget;
	let value = el.getAttribute('data-value');
	let text = el.textContent;
	let parent = $(el).parents('.input-field');
	let input = parent.find('[type=hidden]');
	let valueContainer = parent.find('.current span');
	valueContainer.text(text);
	input.val(value);
	if(text == ""){
		parent.find('.current').addClass('empty');
	}else{
		parent.find('.current').removeClass('empty');
	}
	parent.removeClass('hover');
	e.stopPropagation();
	let elNoNeedRecall = <HTMLElement>document.getElementById("dont-recall-wrapper");
	if(value != 'undefined'){
	    elNoNeedRecall.classList.remove('hidden');
    }else{
        elNoNeedRecall.classList.add('hidden');
        let inputNoNeedRecall = <HTMLInputElement>document.getElementById('dont-recall');
        inputNoNeedRecall.removeAttribute('checked');
    }
});

$('body').on('click', (e:JQuery.ClickEvent) => {
	let path = e.originalEvent?.composedPath();
	let filtered = path.filter(el => {
		let element = <HTMLElement>el;
		if(element.classList){
			return element.classList.contains('input-field');
		}
	});
	if(!filtered.length){
		$('.input-field').removeClass('hover');
	}
});
// #endregion

// Переключение readonly для полей доставки в корзине
$('body').on('change', '[name=address]', (e:JQuery.ChangeEvent) => {
	let el = e.currentTarget;
	let inputs = $('.address-details .input-field');
	let id = el.id;

	if(id == "other"){
		inputs.find('input').removeAttr("disabled");
		inputs.removeClass('disable');
	}else{
		inputs.find('input').attr("disabled", "disabled");
		inputs.addClass('disable');
	}

	$('[name=city]').val(el.dataset['city']);
	$('[name=street]').val(el.dataset['street']);
	$('[name=house]').val(el.dataset['house']);
	$('[name=block]').val(el.dataset['block']);
	$('[name=app]').val(el.dataset['app']);
	$('[name=entrance]').val(el.dataset['entrance']);
	$('[name=floor]').val(el.dataset['floor']);
	$('[name=domofon]').val(el.dataset['domofon']);
	
});

// Отображение поля Интервал в корзине
$('body').on('change', '[name=delivery-day]', (e:JQuery.ChangeEvent) => {
	let el = e.currentTarget;
	let id = el.id;

	if(id === 'manual'){
		$('#delivery-date').addClass('visible');
	}else{
		$('.delivery-details').removeClass('visible');
	}
});

// Отображение деталей заказа на странице профиля
$('body').on('click', '.order-row', (e:JQuery.ClickEvent) => {
	
	
	let el = e.currentTarget;
	let $nextEl = $(el).next().find('.table-wrapper');
	let already = $nextEl.css('display') == 'block';

	$('.order-details .table-wrapper').slideUp('fast');

	if(!already){
		$nextEl.slideDown('fast');
	}
});

// Отображение балланса на странице профиля
$('body').on('click', '.toggle-ballance', (e:JQuery.ClickEvent) => {
	e.preventDefault();
	let el = <HTMLLinkElement>e.currentTarget;
	let i = <HTMLElement>el.children[0];
	let ballanceInput = <HTMLInputElement>document.getElementById('ballance');
	let attr = ballanceInput.getAttribute("type");
	let className = attr == "text" || !attr ? 'mdi mdi-eye' : 'mdi mdi-eye-off';
	ballanceInput.setAttribute("type", attr == "text" || !attr ? "password" : "text");
	i.className = className;
})

// Скрытие sidenav при изменении размеров окна браузера
$(window).on('resize', () => {
	if(window.innerWidth >= 800){
		document.querySelectorAll('.sidenav').forEach((el:HTMLDivElement) => {
			let sidenav = M.Sidenav.getInstance(el);
			sidenav.close();
		});

		$('.disclaimer-content').removeAttr('style');
	}

	$('.material-tooltip').css({
		top: 0,
		left: 0
	})
});

// Синхронизация форм
$('.filters input').on("input", (e:JQuery.ChangeEvent) => {

	let element = e.currentTarget;
	let id = element.id;
	let isMobile = id.indexOf('mobile') >= 0;
	e.stopPropagation();

	// Поиск дубиката
	let doubleId = isMobile ? id.replace('mobile', 'desktop') : id.replace('desktop', 'mobile');
	let suffix = isMobile ? "desktop" : "mobile";
	$('#' + doubleId).val(element.value);
	$('#' + doubleId).attr("checked", element.checked);

	// Обновление слайдера
	// let $doubleContainer = $('#'+doubleId).parents('form');
	// let doubleMin = parseInt($doubleContainer.find(".min").val()?.toString());
	// let doubleMax = parseInt($doubleContainer.find(".max").val()?.toString());
	// let values = [doubleMin, doubleMax];
	// // let slider = (document.getElementById('price-range-' + suffix) as any).noUiSlider;
	// slider.set(values);
});

// Автоизменение Textarea
$('body').on('input', 'textarea', (e:JQuery.KeyDownEvent) => {
	let el = <HTMLInputElement>e.currentTarget;
	el.style.height = "5px";
	el.style.height = (el.scrollHeight + 1) + "px";
});

// #endregion

// #region Инициализация слайдеров ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
let actionsSlider = $('#actions-slider').length ? new Swiper('#actions-slider', {
	speed: 800,
	loop: true,
	autoplay: {
		delay: 3000
	},
	pagination:{
		type: 'bullets',
		el: '.actions-pagination',
		clickable: true
	}
}): null;

let actionsMobileSlider = $('#actions-slider-mobile').length ? new Swiper('#actions-slider-mobile', {
	speed: 800,
	loop: true,
	autoplay: {
		delay: 3000
	},
	pagination:{
		type: 'bullets',
		el: '.actions-pagination',
		clickable: true
	}
}) : null;

if(actionsSlider && actionsMobileSlider){
	actionsSlider.controller.control = actionsMobileSlider;
	actionsMobileSlider.controller.control = actionsSlider;
}

let popularSlider = $('#pop-slider').length ? new Swiper('#pop-slider', {
	loop: true,
	speed: 800,
	breakpoints:{
		400:{
			slidesPerView: 1
		},
		600:{
			slidesPerView: 2,
			spaceBetween: 15
		},
		1201:{
			slidesPerView: 1
		}
	},
	pagination:{
		type: 'bullets',
		el: '.pop-pagination',
		clickable: true
	}
}): null;

let waterSlider = $('#water-slider').length ? new Swiper('#water-slider', {
	loop: true,
	spaceBetween: 20,
	pagination: {
		el: '.water-pagination',
		type: 'bullets',
		clickable: true,
		dynamicBullets: true,
		dynamicMainBullets: 6
	},
	breakpoints: {
		400: {
			slidesPerView: 1
		},
		800: {
			slidesPerView: 2
		},
		1350: {
			slidesPerView: 3
		}
	}
}): null;

let coolersSlider = $('#coolers-slider').length ? new Swiper('#coolers-slider', {
	loop: true,
	spaceBetween: 20,
	pagination: {
		el: '.coolers-pagination',
		type: 'bullets',
		clickable: true,
		dynamicBullets: true,
		dynamicMainBullets: 6
	},
	breakpoints: {
		400: {
			slidesPerView: 1
		},
		800: {
			slidesPerView: 2
		},
		1350: {
			slidesPerView: 3
		}
	}
}): null;

let newsActionsSlider = $('#news-actions-slider').length ? new Swiper('#news-actions-slider', {
	loop: true,
	spaceBetween: 20,
	speed: 800,
	pagination: {
		type: 'bullets',
		el: '.news-actions-pagination'
	},
	autoplay: {
		delay: 5000
	},
	breakpoints: {
		400: {
			slidesPerView: 1
		},
		1000: {
			slidesPerView: 2
		},
		1700: {
			slidesPerView: 3
		}
	}
}): null;

let newsSlider = $('#news-slider').length ? new Swiper('#news-slider', {
	loop: true,
	spaceBetween: 20,
	pagination: {
		type: 'bullets',
		el: '.news-swiper-pagination'
	},
	breakpoints: {
		400: {
			slidesPerView: 1
		},
		1000: {
			slidesPerView: 2
		},
		1700: {
			slidesPerView: 3
		}
	}
}): null;

let productActionsSlider = $('#product-actions').length ? new Swiper('#product-actions', {
	loop: true,
	speed: 800,
	pagination: {
		el: '.actions-pagination',
		type: 'bullets',
		clickable: true
	},
	autoplay: {
		delay: 2000
	}
}): null;

let productOffersSlider = $('#product-offers').length ? new Swiper('#product-offers', {
	loop: true,
	speed: 800,
	pagination: {
		el: '.offers-pagination',
		type: 'bullets',
		clickable: true,
		dynamicBullets: true,
		dynamicMainBullets: 5
	},
	breakpoints: {
		400: {
			slidesPerView: 1
		},
		800: {
			slidesPerView: 2
		},
		1200: {
			slidesPerView: 1
		}
	},
	autoplay: {
		delay: 3000
	}
}): null;

let productSlider = $('#product-swiper').length ? new Swiper('#product-swiper', {
	loop: true,
	pagination: {
		el: '#product-pagination',
		type: 'bullets'
	},
	navigation: {
		nextEl: '.product-next',
		prevEl: '.product-prev'
	}
}) : null ;
// #endregion

// #region Функции :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function loadScript(url:string, callback:() => void){

	var script = <any>document.createElement("script")
	script.type = "text/javascript";

	if (script.readyState){  //IE
		script.onreadystatechange = function(){
			if (script.readyState == "loaded" ||
					script.readyState == "complete"){
				script.onreadystatechange = null;
				callback();
			}
		};
	} else {  //Others
		script.onload = function(){
			callback();
		};
	}

	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}
// #endregion
