class Zoomer{

	slides = [];
	isDragging:boolean;
	startX:number;
	startY:number;

	constructor(selector:string, srcAttribute:string, isDataSet:boolean){

		document.querySelectorAll(selector).forEach((element:HTMLImageElement) => {
			if(!isDataSet && srcAttribute != 'src'){
				this.slides.push(element.src);
			}else{
				this.slides.push(element.dataset[srcAttribute]);
			}
			element.addEventListener('click', this.open.bind(this));
		})
	}

	open(e:MouseEvent)
	{
		// Формирование индексов
		let el = <HTMLImageElement>e.currentTarget;
		let root = location.origin;
		let image = el.src.split(root)[1];

		if(!image){
			image = el.style.backgroundImage.replace("url(\"", '').replace('\")', '');
		}

		let index = this.slides.indexOf(image);
		let prev = index - 1;
		let next = index + 1;
		if(prev < 0){ prev = this.slides.length - 1 }
		if(next >= this.slides.length){ next = 0 }

		let prevImg = this.slides[prev];
		let nextImg = this.slides[next];

		// Формирование изображений
		let currentImgEl = <HTMLImageElement>document.createElement('img');
		let nextImgEl = <HTMLImageElement>document.createElement('img');
		let prevImgEl = <HTMLImageElement>document.createElement('img');
		currentImgEl.src = image;
		nextImgEl.src = nextImg;
		prevImgEl.src = prevImg;

		// Формирование DOM::::::::::::::::::::::::::::::::::::::::::::::::::::
		// Формируем оболочку
		let slideboxWrapper = document.createElement('div');
		slideboxWrapper.className = 'zoomer-wrapper';
		let slidebox = document.createElement('div');
		slidebox.classList.add('zoomer-viewer');

		let closer = document.createElement('i');
		closer.className = "closer mdi mdi-close";

		let prevArrow = document.createElement('a');
		prevArrow.className = "zoomer-arrow prev mdi mdi-chevron-left";
		prevArrow.addEventListener('click', this.prev.bind(this));

		let nextArrow = document.createElement('a');
		nextArrow.className = "zoomer-arrow next mdi mdi-chevron-right";
		nextArrow.addEventListener('click', this.next.bind(this));

		// Формируем оболочку для текущего, предыдущего и следующего слайдера
		let prevSlide = document.createElement('div');
		let nextSlide = document.createElement('div');
		let currentSlide = document.createElement('div');
		prevSlide.className = 'zoomer-slide zoomer-prev';
		currentSlide.className = 'zoomer-slide zoomer-current';
		nextSlide.className = 'zoomer-slide zoomer-next';

		prevSlide.appendChild(prevImgEl);
		nextSlide.appendChild(nextImgEl);
		currentSlide.appendChild(currentImgEl);

		slideboxWrapper.appendChild(closer);
		slideboxWrapper.appendChild(prevArrow);
		slideboxWrapper.appendChild(nextArrow);

		slidebox.append(...[prevSlide, currentSlide, nextSlide]);
		slideboxWrapper.appendChild(slidebox);
		document.body.appendChild(slideboxWrapper);

		setTimeout(() => {
			slideboxWrapper.classList.add('open');
		}, 80);
		// slidebox.scrollLeft = currentImgEl.clientWidth;
		slidebox.scrollLeft = currentSlide.clientWidth;

		// Задаём события
		slidebox.addEventListener('mousedown', this.startDrag.bind(this));
		slidebox.addEventListener('mousemove', this.moveDrag.bind(this));
		slidebox.addEventListener('mouseup', this.endDrag.bind(this));
		slideboxWrapper.addEventListener('click', this.clickOutside.bind(this));

		slidebox.addEventListener('touchstart', this.touchStart.bind(this), true);
		slidebox.addEventListener('touchmove', this.touchMove.bind(this), true);
		slidebox.addEventListener('touchend', this.touchEnd.bind(this), true);

		slidebox.addEventListener('mouseleave', this.abortDrag.bind(this));
		closer.addEventListener('click', this.close.bind(this));
		document.body.addEventListener('keyup', this.keyboardReact.bind(this), true);

		window.addEventListener('resize', this.updateWidth.bind(this));
		$(window).on('scroll', this.close.bind(this));
	}

	clickOutside(e:MouseEvent)
	{
		let el = <HTMLElement>e.target;
		if(el.tagName.toLowerCase() != 'a' && !el.classList.contains('zoomer-slide'))
		{
			this.close();
		}
	}

	startDrag(e:MouseEvent)
	{
		this.startX = e.clientX;
		this.startY = e.clientY;
		this.isDragging = true;
	}

	abortDrag(e:MouseEvent)
	{
		if(this.isDragging){

			let el = <HTMLDivElement>e.currentTarget;
			this.isDragging = false;
			this.startX = null;
			this.startY = null;
	
			$('.zoomer-viewer').animate({
				scrollLeft: el.clientWidth
			}, 400, null);
		}
	}

	moveDrag(e:MouseEvent)
	{
		let el = <HTMLDivElement>e.currentTarget;
		let width = el.clientWidth;
		if(this.isDragging){
			let currentX = this.startX - e.clientX + width;
			(<HTMLDivElement>el).scrollLeft = currentX;
		}
	}

	endDrag(e:MouseEvent)
	{

		this.isDragging = false;

		let diff = Math.abs(e.clientX - this.startX);
		if(diff == 0) return
		let el = <HTMLDivElement>e.currentTarget;


		if(e.clientX < this.startX){
			$('.zoomer-viewer').animate({
				scrollLeft: el.clientWidth * 2
			}, 400, null, this.afterMatch.bind(this));
		}else{
			$('.zoomer-viewer').animate({
				scrollLeft: 0
			}, 400, null, this.afterMatch.bind(this));
		}

		this.startX = null;
		this.startY = null;
	}

	touchStart(e:TouchEvent)
	{
		let touch = e.touches[0];
		this.startX = touch.clientX;
		this.startY = touch.clientY;
		this.isDragging = true;
	}

	touchMove(e:TouchEvent)
	{
		let touch = e.touches[0];
		let el = <HTMLDivElement>e.currentTarget;
		let width = el.clientWidth;
		if(this.isDragging){
			let currentX = this.startX - touch.clientX + width;
			(<HTMLDivElement>el).scrollLeft = currentX;
		}
	}

	touchEnd(e:TouchEvent)
	{
	
		this.isDragging = false;
		let touch = e.changedTouches[0];

		let diff = Math.abs(touch.clientX - this.startX);
		if(diff == 0) return
		let el = <HTMLDivElement>e.currentTarget;


		if(touch.clientX < this.startX){
			$('.zoomer-viewer').animate({
				scrollLeft: el.clientWidth * 2
			}, 400, null, this.afterMatch.bind(this));
		}else{
			$('.zoomer-viewer').animate({
				scrollLeft: 0
			}, 400, null, this.afterMatch.bind(this));
		}

		this.startX = null;
		this.startY = null;
	}

	afterMatch()
	{

		let zoomer = document.querySelector('.zoomer-viewer');
		if(!zoomer){ return; }
		let root = location.origin;

		let direction = document.querySelector('.zoomer-viewer').scrollLeft == 0 ? 'prev' : 'next';
		let newCurrentEl = <HTMLImageElement>document.querySelector('.zoomer-' + direction+ ' img');

		let img = newCurrentEl.src.split(root)[1];
		let newCurrentIndex = this.slides.indexOf(img);

		let nextIndex = newCurrentIndex + 1;
		let prevIndex = newCurrentIndex - 1;

		if(nextIndex >= this.slides.length){ nextIndex = 0}
		if(prevIndex < 0){prevIndex = this.slides.length - 1}

		let newCurrentSrc = img;
		let nextSrc = this.slides[nextIndex];
		let prevSrc = this.slides[prevIndex];

		(<HTMLImageElement>document.querySelector('.zoomer-prev img')).src = prevSrc;
		(<HTMLImageElement>document.querySelector('.zoomer-next img')).src = nextSrc;
		(<HTMLImageElement>document.querySelector('.zoomer-current img')).src = img;
		
		zoomer.scrollLeft = zoomer.clientWidth;
	}

	keyboardReact(e:KeyboardEvent)
	{
		switch(e.key){
			case 'Escape': this.close(); break;
			case 'ArrowLeft': this.prev(); break;
			case 'ArrowRight': this.next(); break;
		}
		e.stopImmediatePropagation();
	}

	next()
	{
		let zoomer = document.querySelector('.zoomer-viewer');
		let width = zoomer?.clientWidth;

		$(zoomer).animate({
			scrollLeft: width * 2
		}, 400, null, this.afterMatch.bind(this))
	}

	prev()
	{
		let zoomer = document.querySelector('.zoomer-viewer');
		let width = zoomer?.clientWidth;

		$(zoomer).animate({
			scrollLeft: 0
		}, 400, null, this.afterMatch.bind(this))
	}

	close()
	{
		let globalWrapper = document.querySelector('.zoomer-wrapper');
		if(!globalWrapper) return;

		let zoomer = globalWrapper.querySelector('.zoomer-viewer');
		zoomer?.removeEventListener('mousedown', this.startDrag);
		zoomer?.removeEventListener('mousemove', this.moveDrag);
		zoomer?.removeEventListener('mouseup', this.endDrag);

		zoomer.addEventListener('touchstart', this.touchStart.bind(this));
		zoomer.addEventListener('touchmove', this.touchMove.bind(this));
		zoomer.addEventListener('touchend', this.touchEnd.bind(this));

		zoomer?.removeEventListener('mouseleave', this.abortDrag);
		globalWrapper?.removeEventListener('click', this.close);
		document.body.onkeyup = null;

		globalWrapper.classList.remove('open');
		setTimeout(() => {
			globalWrapper?.remove();
		}, 400)
	}

	updateWidth()
	{
		let el = <HTMLDivElement>document.querySelector('.zoomer-viewer');
		let width = el.clientWidth;
		el.scrollLeft = width;
	}
}

export default Zoomer;