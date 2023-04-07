class DOMCrawler{

	/**
	 * 
	 * @param selector{string} Селектор элемента DOM
	 */

	el: NodeListOf<Element>;

	constructor(selector:string){
		this.el = document.querySelectorAll(selector);
	}

	parent():HTMLElement|HTMLElement[]{

		let array = Array.from(this.el);
		if(array.length == 0) return null;
		if(array.length == 1){
			let html_element = this.el[0] as HTMLElement;
			return html_element.parentNode as HTMLElement;
		}else{

			let parents:HTMLElement[];
			array.forEach((el) => {
				parents.push((el as HTMLElement).parentNode as HTMLElement);
			})

			return parents;
		}
	}
}

export default DOMCrawler;