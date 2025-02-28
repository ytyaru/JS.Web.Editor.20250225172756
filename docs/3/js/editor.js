;(function(){
class Editor {
    static #count = 0;
    constructor(width, height, q) {
        this._id = Editor.#count++;
//        this._textAreaIds = 'html css js'.split(' ').map(id=>`web-editor-${id}`);
        //this.#init(q);
        const target = document.querySelector(q);
        if (!target){throw new TypeError(`次の要素は存在しません：${q}`)}
        target.appendChild(this.#makeEditor(width, height));
        // resultのサイズ
//        const W = parseInt(this.html.getBoundingClientRect().width);
//        this.result.width = W;

        //this._console = new EditorConsole(document.querySelector(`#web-editor-console`));
        this._console = new EditorConsole(this.console);
        this._isConsole = false;
        this.build();
    }
    get html() {return this.#ui('html')}
    get css() {return this.#ui('css')}
    get js() {return this.#ui('js')}
    get console() {return this.#ui('console')}
    get result() {return this.#ui('result')}
    #ui(name) {return document.querySelector(`#web-editor-${this._id} *[name="${name}"]`)}
//    get webgl2() {return this._webgl2;}
    async build() {await this.#build(...this.#allSources)}
    /*
    #init(q) {
        document.querySelector(q).append(...this.#make());
        console.log(document.querySelector(`#web-editor-${this._id} *[name="html"]`));
        const W = parseInt(document.querySelector(`#web-editor-${this._id} *[name="html"]`).getBoundingClientRect().width);
        document.querySelector(`#web-editor-${this._id} *[name="result"]`).width = W;
    }
    */
    #makeEditor(width='100%', height='99vh') {
        width = Number.isInteger(width) ? `${width}px` : width;
        height = Number.isInteger(height) ? `${height}px` : height;
        //<main id="main" style="display:grid;grid-template-columns:repeat(4,1fr);width:100%;height:99vh;"></main>
        const div = document.createElement('div');
        div.id = `web-editor-${this._id}`;
        //div.style = `display:grid;grid-template-columns:repeat(4,1fr);width:100%;height:99vh;`;
        div.style = `display:grid;grid-template-columns:repeat(4,1fr);width:${width};height:${height};box-sizing:content-box;border:solid black 1px;padding:0;margin:0;`;
        div.append(...this.#make(width, height));
        return div;
//        const W = parseInt(document.querySelector(`#web-editor-${this._id} *[name="html"]`).getBoundingClientRect().width);
//        //document.querySelector(`#web-editor-result`).width = W;
//        document.querySelector(`#web-editor-${this._id} *[name="result"]`).width = W;
    }
    #make(width='100%', height='99vh') {
        const code = {
            html: `<h1>Web Editor</h1>
<div id="div-0"></div>`,
            css: `#div-0{color:red;}`,
            js: `document.querySelector('#div-0').textContent = 'Hello world !!';
console.log(document.querySelector('#div-0').textContent);

console.assert(true);
console.assert(false);

console.clear();

console.count();
console.count();
console.count();

console.count('C');
console.count('C');
console.count('C');

console.debug('D');
console.error('E');
console.info('I');
console.log('L');
console.trace('T');
console.warn('W');

console.time('T');
console.timeLog('T');
console.timeEnd('T');`,
        };
        const resDiv = van.tags.div({name:'result-div'});
        resDiv.append(
            van.tags.textarea({name:'console',resize:'none', style:`box-sizing:content-box;width:98%;height:${height};padding:0;margin:0;`, onclick:()=>this.#switchResult((this._isConsole=false))}),
            van.tags.div({name:'result', style:`box-sizing:content-box;height:${height};padding:0;margin:0;`, onclick:()=>this.#switchResult((this._isConsole=true))}));
        return [
            van.tags.textarea({name:'html',resize:'none',value:code.html, style:`box-sizing:content-box;height:${height};padding:0;margin:0;`, oninput:async(e)=>await this.#build(...this.#getSource(e,0))}),
            van.tags.textarea({name:'css',resize:'none',value:code.css, style:`box-sizing:content-box;height:${height};padding:0;margin:0;`, oninput:async(e)=>await this.#build(...this.#getSource(e,1))}),
            van.tags.textarea({name:'js',resize:'none',value:code.js, style:`box-sizing:content-box;height:${height};padding:0;margin:0;`, oninput:async(e)=>await this.#build(...this.#getSource(e,2))}),
            resDiv,
        ];
        /*
        const resDiv = van.tags.div({id:'web-editor-result-div'});
        resDiv.append(
            van.tags.textarea({id:'web-editor-console',resize:'none', style:'box-sizing:content-box;width:100%;height:100%;', onclick:()=>this.#switchResult((this._isConsole=false))}),
            van.tags.div({id:'web-editor-result', style:'min-height:92vh;', onclick:()=>this.#switchResult((this._isConsole=true))}));
        return [
            van.tags.textarea({id:'web-editor-html',resize:'none',value:code.html, oninput:async(e)=>await this.#build(...this.#getSource(e,0))}),
            van.tags.textarea({id:'web-editor-css',resize:'none',value:code.css, oninput:async(e)=>await this.#build(...this.#getSource(e,1))}),
            van.tags.textarea({id:'web-editor-js',resize:'none',value:code.js, oninput:async(e)=>await this.#build(...this.#getSource(e,2))}),
            resDiv,
        ];
        */
    }
    //get #textAreaIds(){return this._textAreaIds}
    //get #textAreaIds(){return 'html css js'.split(' ')}
    get #textAreaNames(){return 'html css js'.split(' ')}
    get #allSources(){return this.#textAreaNames.map(name=>document.querySelector(`#web-editor-${this._id} *[name="${name}"]`).value)}
    #getSource(e, inputNo) {
        if (inputNo < 0 || this.#textAreaNames.length <= inputNo){throw new TypeError(`引数inputNoは0〜2の整数であるべきです。`)}
//        return this.#textAreaNames.map((id,i)=>i===inputNo ? e.target.value : document.querySelector(`#${this.#textAreaNames[i]}`).value)
        return this.#textAreaNames.map((name,i)=>i===inputNo ? e.target.value : document.querySelector(`#web-editor-${this._id} *[name="${name}"]`).value);
    }
    async #build(htmlCode, cssCode, jsCode) {
//        const LOG = document.querySelector(`#web-editor-${this._id} *[name="console"]`);
//        LOG.value = '';
        this._console.init();
        document.querySelector(`#web-editor-${this._id} *[name="result"]`).innerHTML = `${htmlCode}<style>${cssCode}</style>`;
        try {this.#jsBuild(jsCode);}
        catch(err){this.console.value=err.message}
        //catch(err){LOG.value=err.message}
        this.#switchResult(this._isConsole);
        //this.#switchResult();
//        this.#switchResult(0 < LOG.value.length);
    }
    #jsBuild(jsCode) {//外部送信禁止（セキュリティ）ただしHTMLで<script>を使いFETCH=fetch;等とされたら対策できない。
        return (new Function('fetch', 'XMLHttpRequest', 'console', jsCode))(null,null,this._console);
    }
    //#jsBuild(jsCode) {return (new Function('fetch', 'XMLHttpRequest', jsCode))(null,null);}//外部送信禁止（セキュリティ）
    //#jsBuild(jsCode) {return (new Function(jsCode))();}
    //#jsBuild(jsCode) {console.log(jsCode, this._webgl2.gl);return (new Function('gl', 'program', jsCode))(this._webgl2.gl, this._webgl2.program);}
    //#jsBuild(jsCode) {console.log(jsCode, this._webgl2.gl);return (new Function('gl', 'program', `(async function() {${jsCode}})();`))(this._webgl2.gl, this._webgl2.program);}
    #switchResult(isError=false) {
        console.log('switchResult', isError)
        document.querySelector(`#web-editor-${this._id} *[name="console"]`).style.display = isError ? 'block' : 'none';
        document.querySelector(`#web-editor-${this._id} *[name="result"]`).style.display = isError ? 'none' : 'block';
    }
    /*
    #log(...args) {document.querySelector(`#web-editor-${this._id} *[name="console"]`).value += [...args].join(' ');}
    #assert(...args) {
        this._assert.count++;
        if ('boolean'!==typeof args[0]){throw new TypeError(`console.assert()の引数は真偽値であるべきです。`)}
        document.querySelector(`#web-editor-${this._id} *[name="console"]`).value += `Assertion failed\n`;
    }
    */
}
class EditorConsole {// console.log等の代替
    constructor(el) {
        this._el=el;// document.querySelector(`#web-editor-console`)
        this._count = {default:0, labels:new Map()};
        this._time = {default:null, labels:new Map()};
    }
    init() {
        this.clear();
        this._count.default = 0;
        this._count.labels.clear();
        this._time.default = 0;
        this._time.labels.clear();
    }
    assert(...args) {
        if ('boolean'!==typeof args[0]){throw new TypeError(`console.assert()の引数は真偽値であるべきです。`)}
        if (!args[0]) {this._el.value += `Assertion failed: ${[...args].join(' ')}\n`;}
    }
    clear(...args) {this._el.value=''}
    count(...args) {
        if (0===args.length) {this._count.default++}
        else if ('string'===typeof args[0] || args[0] instanceof String){
            if (this._count.labels.has(args[0])) {this._count.labels.set(args[0], this._count.labels.get(args[0])+1)}
            else {this._count.labels.set(args[0], 1)}
        }
        else {throw new TypeError(`console.count()の引数は無しか任意文字列であるべきです。`)}
        this._el.value += (0===args.length) 
            ? `default: ${this._count.default}\n`
            : `${args[0]}: ${this._count.labels.get(args[0])}\n`
    }
    countReset(...args) {
        if (undefined===args){this._count.default = 0;}
        else if ('string'===typeof args[0] || args[0] instanceof String){this._count.labels.set(args[0], 0);}
    }
    debug(...args) {this._el.value += `[debug] ${[...args].join(' ')}\n`;}
    dir(...args) {throw new Error(`未実装`)}
    dirxml(...args) {throw new Error(`未実装`)}
    error(...args) {this._el.value += `[error] ${[...args].join(' ')}\n`;}
    group(...args) {throw new Error(`未実装`)}
    groupCollapsed(...args) {throw new Error(`未実装`)}
    groupEnd(...args) {throw new Error(`未実装`)}
    info(...args) {this._el.value += `[info] ${[...args].join(' ')}\n`;}
    log(...args) {this._el.value += [...args].join(' ') + '\n';}
    profile(...args) {throw new Error(`未実装`)}
    profileEnd(...args) {throw new Error(`未実装`)}
    table(...args) {throw new Error(`未実装`)}
    time(...args) {
        if (undefined===args[0]){this._time.default=new Date();}
        else if ('string'===typeof args[0] || args[0] instanceof String){this._time.labels.set(args[0], new Date())}
        else {throw new TypeError(`console.time()の引数は無しか任意文字列であるべきです。`)}
    }
    timeEnd(...args) {
        this.#timeLog(args[0], 'timeEnd')
        if (undefined===args[0]){this._time.default = null}
        else {this._time.labels.set(args[0],null)}
    }
    timeLog(...args) {this.#timeLog(args[0], 'timeLog')}
    #timeLog(label, name) {
        if (!(undefined===label || 'string'===typeof label || label instanceof String)){throw new TypeError(`console.${name}()の引数は無しか任意文字列であるべきです。`)}
        else if (('string'===typeof label || label instanceof String) && !this._time.labels.has(label)) {throw new TypeError(`console.${name}()のラベルが存在しません。:${label}`)}
        const start = ('string'===typeof label || label instanceof String)
            ? this._time.labels.get(label)
            : this._time.default
        if (!(start instanceof Date)) {throw new TypeError(`console.${name}('${label}')はtime('${label}')してから呼び出してください。`)}
        const end = new Date();
        this._el.value += `${label ?? 'defult'}: ${end.getTime() - start.getTime()} ms\n`;
    }
    timeStamp(...args) {throw new Error(`未実装`)}
    trace(...args) {this._el.value += `[trace] ${[...args].join(' ')}\n`;}
    warn(...args) {this._el.value += `[warn] ${[...args].join(' ')}\n`;}
}
window.Editor = Editor;
})();
