;(function(){
class Editor {
    constructor(width, height, q) {
        this._textAreaIds = 'html css js'.split(' ').map(id=>`web-editor-${id}`);
        this.#init(q);
    }
    get webgl2() {return this._webgl2;}
    async build() {await this.#build(...this.#allSources)}
    #init(q) {
        document.querySelector(q).append(...this.#make());
        console.log(document.querySelector(`#web-editor-html`));
        const W = parseInt(document.querySelector(`#web-editor-html`).getBoundingClientRect().width);
        document.querySelector(`#web-editor-result`).width = W;
    }
    #make() {
        const code = {
            html: `<h1>Web Editor</h1>
<div id="div-0"></div>`,
            css: `#div-0{color:red;}`,
            js: `document.querySelector('#div-0').textContent = 'Hello world !!';
console.log(document.querySelector('#div-0').textContent);`,
        };
        const resDiv = van.tags.div({id:'web-editor-result-div'});
        resDiv.append(
            van.tags.textarea({id:'web-editor-log',resize:'none', style:'box-sizing:content-box;width:100%;height:100%;'}),
            van.tags.div({id:'web-editor-result'}));
        return [
            van.tags.textarea({id:'web-editor-html',resize:'none',value:code.html, oninput:async(e)=>await this.#build(...this.#getSource(e,0))}),
            van.tags.textarea({id:'web-editor-css',resize:'none',value:code.css, oninput:async(e)=>await this.#build(...this.#getSource(e,1))}),
            van.tags.textarea({id:'web-editor-js',resize:'none',value:code.js, oninput:async(e)=>await this.#build(...this.#getSource(e,2))}),
            resDiv,
        ];
    }
    get #textAreaIds(){return this._textAreaIds}
    get #allSources(){return this.#textAreaIds.map(id=>document.querySelector(`#${id}`).value)}
    #getSource(e, inputNo) {
        if (inputNo < 0 || this.#textAreaIds.length <= inputNo){throw new TypeError(`引数inputNoは0〜2の整数であるべきです。`)}
        return this.#textAreaIds.map((id,i)=>i===inputNo ? e.target.value : document.querySelector(`#${this.#textAreaIds[i]}`).value)
    }
    async #build(htmlCode, cssCode, jsCode) {
        const LOG = document.querySelector(`#web-editor-log`);
        LOG.value = '';
        document.querySelector(`#web-editor-result`).innerHTML = `${htmlCode}<style>${cssCode}</style>`;
        try {this.#jsBuild(jsCode);}
        catch(err){LOG.value=err.message}
        this.#switchResult(0 < LOG.value.length);
    }
    #jsBuild(jsCode) {return (new Function('fetch', 'XMLHttpRequest', jsCode))(null,null);}//外部送信禁止（セキュリティ）
    //#jsBuild(jsCode) {return (new Function(jsCode))();}
    //#jsBuild(jsCode) {console.log(jsCode, this._webgl2.gl);return (new Function('gl', 'program', jsCode))(this._webgl2.gl, this._webgl2.program);}
    //#jsBuild(jsCode) {console.log(jsCode, this._webgl2.gl);return (new Function('gl', 'program', `(async function() {${jsCode}})();`))(this._webgl2.gl, this._webgl2.program);}
    #switchResult(isError=false) {
        document.querySelector(`#web-editor-log`).style.display = isError ? 'block' : 'none';
        document.querySelector(`#web-editor-result`).style.display = isError ? 'none' : 'block';
    }
    #log(...args) {document.querySelector(`#web-editor-log`).value += [...args].join(' ');}
    #assert() {
        document.querySelector(`#web-editor-log`).value += 
    }
}
window.Editor = Editor;
})();
