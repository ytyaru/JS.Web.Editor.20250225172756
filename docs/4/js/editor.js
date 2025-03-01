;(function(){
class Editor {
    static #count = 0;
    //constructor(width, height, q) {
    constructor(options) {
        this._idNo = Editor.#count++;
        this._resultName = 'result';
        this._options = (options && 'object'===typeof options && '[object Object]'===Object.prototype.toString.call(options))
            ? {...this.#defaultOptions, ...options}
            : this.#defaultOptions;
        this._el = this.#makeEditor();
        this.#append();
        this._console = new EditorConsole(this.log);
        //this._resultName = 'result';
        this.build();
    }
    get #id() {return this._options.id}
    get el() {return this._el}
    get html() {return this.#ui('html')}
    get css() {return this.#ui('css')}
    get js() {return this.#ui('js')}
    get log() {return this.#ui('log')}
    get result() {return this.#ui('result')}
    get document() {return this.#ui('document')}
    #ui(name) {return document.querySelector(`#web-editor-${this._idNo} *[name="${name}"]`)}
//    get webgl2() {return this._webgl2;}
    async build() {await this.#build(...this.#allSources)}
    #append() { if (this._options.q) {
        const target = document.querySelector(this._options.q);
        if (!target){throw new TypeError(`次の要素は存在しません：${this._options.q}`)}
        //target.appendChild(this.#makeEditor());
        target.appendChild(this._el);
        if ('switch'===this._options.result.method){this.#switchResult()}
    }}
    get #defaultOptions() { return {
        width: '100%',
        height: 300, // '99vh'
        q: 'body',
        id: `web-editor-${this._idNo}`,
        name: `web-editor-${this._idNo}`,
        row: 1, // 1,2,3,...(0以下なら1行1要素のみ。要素数より多い数なら1行1要素)
        // ソースコード（空なら非表示。設定でON/OFF切替可）
        html: '<h1>Web Editor</h1>\n<div id="div-0"></div>',
        css: '#div-0{color:red;}',
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
        doc: '# WebEditor\n\n　ブラウザ上で任意にHTML,CSS,JSコードを入力し、実行できます。', // Markdown
        // 結果表示方法
        result: {
            target: 'log res doc', // log,res,doc を表示したい順と内容で記入する
            method: 'show',        // 'hide'/'show'/'switch'（targetを全部非表示、全部表示、一つずつ表示（クリック等で切替））
        },
    } }
    #init(options) {
        
    }
    /*
    #init(q) {
        document.querySelector(q).append(...this.#make());
        console.log(document.querySelector(`#web-editor-${this._idNo} *[name="html"]`));
        const W = parseInt(document.querySelector(`#web-editor-${this._idNo} *[name="html"]`).getBoundingClientRect().width);
        document.querySelector(`#web-editor-${this._idNo} *[name="result"]`).width = W;
    }
    */
    //#makeEditor(width='100%', height='99vh') {
    #makeEditor() {
        const W = this._options.width;
        const H = this._options.height;
        const width = Number.isInteger(W) ? `${W}px` : W;
        const height = Number.isInteger(H) ? `${H}px` : H;
        return this.#makeLayoutDiv(width, height);
        /*
        //<main id="main" style="display:grid;grid-template-columns:repeat(4,1fr);width:100%;height:99vh;"></main>
        const div = document.createElement('div');
        //div.id = `web-editor-${this._idNo}`;
        div.id = this.#id;
        //div.style = `display:grid;grid-template-columns:repeat(4,1fr);width:100%;height:99vh;`;
        div.style = `display:grid;grid-template-columns:repeat(4,1fr);grid-template-row:repeat(2,1fr);width:${width};height:${height};box-sizing:content-box;border:solid black 1px;padding:0;margin:0;`;
        div.append(...this.#make(width, height));
        return div;
//        const W = parseInt(document.querySelector(`#web-editor-${this._idNo} *[name="html"]`).getBoundingClientRect().width);
//        //document.querySelector(`#web-editor-result`).width = W;
//        document.querySelector(`#web-editor-${this._idNo} *[name="result"]`).width = W;
        */
    }
    #getShowResultCount() {
        switch(this._options.result.method) {
            case 'hide': return 0
            case 'show': return this._options.result.target.split(' ').filter(v=>v).length;
            case 'switch': return 1
            default: throw new TypeError(`options.result.methodはhide,show,switchのいずれかであるべきです:${this._options.result.method}`)
        }
    }
    #calcShowCount() {
        const srcCnt = 'html css js'.split(' ').map(k=>this._options[k]).filter(v=>v).length;
        const resCnt = this.#getShowResultCount();
        const count = srcCnt + resCnt;
        return [count, srcCnt, resCnt];
    }
    //#getEditorStyle() {
    #calcColRow() {
        const [count, srcCnt, resCnt] = this.#calcShowCount();
        console.log(count, srcCnt, resCnt)
        if (0===count) {throw new TypeError(`少なくともどれか一つは表示してください。`)}
        else if (1===this._options.row) {return [count, 1, -1]}//横一列
        else if (count <= this._options.row) {return [1, count, -1]}//縦一列
        //else if (srcCnt===resCnt && (0===(count % this._options.row))) {//縦横同数
        else if (0===(count % this._options.row)) {//行数で割り切れる
            const row = this._options.row;
            const col = Math.floor(count / row);
            return [col, row, -1]
        }
        else {//縦横の数が異なる（上下で異なるgridレイアウトが必要）
            const row = this._options.row;
            const col = Math.floor(count / row);
            const lastRowCol = count % this._options.row; // 最終行の列数
            return [col, row, lastRowCol]
        }
    }
    #makeGridDiv(col, row, width=null, height=null) {
        const div = document.createElement('div');
        div.style = `display:grid;grid-template-columns:repeat(${col},1fr);grid-template-row:repeat(${row},1fr);box-sizing:content-box;padding:0;margin:0;gap:0;`;
        if (width) {div.style += `;width:${width};`}
        if (height) {div.style += `;height:${height};`}
        // width:${width};height:${height};border:solid black 1px;
        return div;
    }
    #makeChildGridLayout(width, height) {
        const [col, row, lastRowCol] = this.#calcColRow();
        console.log(col, row, lastRowCol)
//        if (1===row && -1===lastRowCol) {return `grid-template-columns:repeat(${col},1fr);`}//横一列
//        if (1===col && -1===lastRowCol) {return `grid-template-row:repeat(${row},1fr);`}//縦一列
        if (1===row && -1===lastRowCol) {console.log('横一列');return [this.#makeGridDiv(col, 1)]}//横一列
        if (1===col && -1===lastRowCol) {return [this.#makeGridDiv(1, row)]}//縦一列
        else {
            if (-1===lastRowCol) {return [this.#makeGridDiv(col, row)]}//縦横同数
//                return `grid-template-columns:repeat(${col},1fr);grid-template-row:repeat(${row},1fr);`
            else {//縦横の数が異なる
                const divs = [...Array(row)].map(()=>this.#makeGridDiv(col, 1))
                divs.push(this.#makeGridDiv(lastRowCol, 1));
                return divs
            }
        }
    }
    #makeMainGridLayout(children) {
//        const children = this.#makeChildGridLayout();
        return 1===children.length
            ? children[0]
            : this.#makeGridDiv(1, children.length)
    }
    #makeLayoutDiv(width, height) {// 画面分割用Div
        /*
        const W = this._options.width;
        const H = this._options.height;
        const width = Number.isInteger(W) ? `${W}px` : W;
        const height = Number.isInteger(H) ? `${H}px` : H;
        */
        const children = this.#makeChildGridLayout(width, height);
        console.log('children.length:', children.length)
        const main = this.#makeMainGridLayout(children);
        main.id = this.#id;
        console.log(main)
        main.style.cssText += `;width:${width};height:${height};border:solid black 1px;padding:0;margin:0;`
        //main.style.cssText = `${main.style.cssText};width:${width};height:${height};border:solid black 1px;padding:0;margin:0;`
        console.log(`${main.style.cssText}`)
        if (1===children.length){
            //main.append(...this.#make(width, height));
            const [col, row, lastRowCol] = this.#calcColRow();
            main.append(...this.#make(width, 1===row ? height : `calc(${height} / ${row});`));
        }
        else {
            const [col, row, lastRowCol] = this.#calcColRow();
            const els = this.#make(width, height);
            //const height = -1===lastRowCol ? `calc(${height} / ${row})` : `calc(${height} / ${row+1})`
            const height = `calc(${height} / ${row + (-1===lastRowCol ? 0 : 1)})`;
            console.log(els)
            for (let r=0; r<row; r++) {
                for (let c=0; c<col; c++) {
                    els[c * (r+1)].style.height = height;
                    children[r].appendChild(els[c * (r+1)])
                }
            }
            //for (let c=0; c<lastRowCol; c++) {children[children.length-1].appendChild(els[c + ((col*row)+1)])}
            for (let c=0; c<lastRowCol; c++) {
                console.log(c + ((col*row)+1))
                els[c + ((col*row)+1)].style.height = height;
                children[children.length-1].appendChild(els[c + ((col*row)+1)])
            }
            main.append(...children);
        }
        return main;
        /*
        const div = document.createElement('div');
        div.id = this.#id;
        //div.style = `display:grid;grid-template-columns:repeat(4,1fr);width:100%;height:99vh;`;
        div.style = `display:grid;grid-template-columns:repeat(4,1fr);grid-template-row:repeat(2,1fr);width:${width};height:${height};box-sizing:content-box;border:solid black 1px;padding:0;margin:0;`;
        div.append(...this.#make(width, height));
        return div;
        */
//        const W = parseInt(document.querySelector(`#web-editor-${this._idNo} *[name="html"]`).getBoundingClientRect().width);
//        //document.querySelector(`#web-editor-result`).width = W;
//        document.querySelector(`#web-editor-${this._idNo} *[name="result"]`).width = W;
    }
    #makeLog(width, height, attrs={}){return van.tags.textarea({name:'log', style:`resize:none;box-sizing:content-box;width:98%;height:${height};padding:0;margin:0;`, ...attrs})}
    #makeRes(width, height, attrs={}){console.log(attrs);return van.tags.div({name:'result', style:`box-sizing:content-box;height:${height};padding:0;margin:0;border:1px solid black;`, ...attrs})}
    #makeDoc(width, height, attrs={}){return van.tags.div({name:'document', style:`box-sizing:content-box;height:${height};padding:0;margin:0;border:1px solid black;`, ...attrs},'this._options.docをmarkdownとしてパースした結果を入れる')}
    //#makeAttrObj(name) {return 'switch'===this._options.result.method ? ({onclick:()=>this.#switchResult((this._resultName=name))}) : ({}); }
    #makeAttrObj(name) {return 'switch'===this._options.result.method ? ({onclick:()=>{console.log('click:',name);this.#switchResult((this._resultName=name))}}) : ({}); }
    //#makeResDiv(width='100%', height='99vh') {
    #makeResult(width='100%', height='99vh') {
        console.log(this.#makeAttrObj(width,height,'result'))
        const log = this.#makeLog(width,height,this.#makeAttrObj('result'));
        const res = this.#makeRes(width,height,this.#makeAttrObj('document'));
        const doc = this.#makeDoc(width,height,this.#makeAttrObj('log'));
        switch(this._options.result.method) {
            case 'hide': return [null]
            case 'show': return [log, res, doc]
            case 'switch': return [van.tags.div({name:'result-div'}, log, res, doc)]
            default: throw new TypeError(`options.result.methodはhide,show,switchのいずれかであるべきです:${this._options.result.method}`)
        }
    }
    /*
    #makeResult(width='100%', height='99vh') {
        const resDiv = van.tags.div({name:'result-div'});
        const log = van.tags.textarea({name:'log', style:`resize:none;box-sizing:content-box;width:98%;height:${height};padding:0;margin:0;`, onclick:()=>this.#switchResult((this._resultName='result'))});
        const res = van.tags.div({name:'result', style:`box-sizing:content-box;height:${height};padding:0;margin:0;`, onclick:()=>this.#switchResult((this._resultName='document'))});
        const doc = van.tags.div({name:'document', style:`box-sizing:content-box;height:${height};padding:0;margin:0;`, onclick:()=>this.#switchResult((this._resultName='log'))}, 'this._options.docをmarkdownとしてパースした結果を入れる');
        resDiv.append(log, res, doc);
        switch(this._options.result.method) {
            case 'hide': return [null]
            case 'show': return [log, res, doc]
            case 'switch': return [resDiv]
            default: throw new TypeError(`options.result.methodはhide,show,switchのいずれかであるべきです:${this._options.result.method}`)
        }
    }
    */
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
        //const res = this.#makeResult(width, height);
        /*
        const resDiv = van.tags.div({name:'result-div'});
        resDiv.append(
            van.tags.textarea({name:'console',resize:'none', style:`box-sizing:content-box;width:98%;height:${height};padding:0;margin:0;`, onclick:()=>this.#switchResult((this._resultName=false))}),
            van.tags.div({name:'result', style:`box-sizing:content-box;height:${height};padding:0;margin:0;`, onclick:()=>this.#switchResult((this._resultName=true))}));
        */
        return [
            van.tags.textarea({name:'html',value:code.html, style:`resize:none;box-sizing:content-box;height:${height};padding:0;margin:0;`, oninput:async(e)=>await this.#build(...this.#getSource(e,0))}),
            van.tags.textarea({name:'css',value:code.css, style:`resize:none;box-sizing:content-box;height:${height};padding:0;margin:0;`, oninput:async(e)=>await this.#build(...this.#getSource(e,1))}),
            van.tags.textarea({name:'js',value:code.js, style:`resize:none;box-sizing:content-box;height:${height};padding:0;margin:0;`, oninput:async(e)=>await this.#build(...this.#getSource(e,2))}),
            ...this.#makeResult(width, height),
//            resDiv,
        ];
        /*
        const resDiv = van.tags.div({id:'web-editor-result-div'});
        resDiv.append(
            van.tags.textarea({id:'web-editor-console',resize:'none', style:'box-sizing:content-box;width:100%;height:100%;', onclick:()=>this.#switchResult((this._resultName=false))}),
            van.tags.div({id:'web-editor-result', style:'min-height:92vh;', onclick:()=>this.#switchResult((this._resultName=true))}));
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
    //get #allSources(){return this.#textAreaNames.map(name=>document.querySelector(`#web-editor-${this._idNo} *[name="${name}"]`).value)}
    get #allSources(){return this.#textAreaNames.map(name=>document.querySelector(`#${this.#id} *[name="${name}"]`).value)}
    #getSource(e, inputNo) {
        if (inputNo < 0 || this.#textAreaNames.length <= inputNo){throw new TypeError(`引数inputNoは0〜2の整数であるべきです。`)}
//        return this.#textAreaNames.map((id,i)=>i===inputNo ? e.target.value : document.querySelector(`#${this.#textAreaNames[i]}`).value)
        //return this.#textAreaNames.map((name,i)=>i===inputNo ? e.target.value : document.querySelector(`#web-editor-${this._idNo} *[name="${name}"]`).value);
        return this.#textAreaNames.map((name,i)=>i===inputNo ? e.target.value : document.querySelector(`#${this.#id} *[name="${name}"]`).value);
    }
    async #build(htmlCode, cssCode, jsCode) {
//        const LOG = document.querySelector(`#web-editor-${this._idNo} *[name="console"]`);
//        LOG.value = '';
        this._console.init();
        //document.querySelector(`#web-editor-${this._idNo} *[name="result"]`).innerHTML = `${htmlCode}<style>${cssCode}</style>`;
        document.querySelector(`#${this.#id} *[name="result"]`).innerHTML = `${htmlCode}<style>${cssCode}</style>`;
        try {this.#jsBuild(jsCode);}
        catch(err){this.log.value=err.message}
        //catch(err){LOG.value=err.message}
//        this.#switchResult();
//        this.#switchResult(this._resultName);
        //this.#switchResult();
//        this.#switchResult(0 < LOG.value.length);
    }
    #jsBuild(jsCode) {//外部送信禁止（セキュリティ）ただしHTMLで<script>を使いFETCH=fetch;等とされたら対策できない。
        return (new Function('fetch', 'XMLHttpRequest', 'console', 'document', jsCode))(null,null,this._console,this.result);
        //return (new Function('fetch', 'XMLHttpRequest', 'console', jsCode))(null,null,this._console);
    }
    //#jsBuild(jsCode) {return (new Function('fetch', 'XMLHttpRequest', jsCode))(null,null);}//外部送信禁止（セキュリティ）
    //#jsBuild(jsCode) {return (new Function(jsCode))();}
    //#jsBuild(jsCode) {console.log(jsCode, this._webgl2.gl);return (new Function('gl', 'program', jsCode))(this._webgl2.gl, this._webgl2.program);}
    //#jsBuild(jsCode) {console.log(jsCode, this._webgl2.gl);return (new Function('gl', 'program', `(async function() {${jsCode}})();`))(this._webgl2.gl, this._webgl2.program);}
    /*
    #switchResult(isError=false) {
        console.log('switchResult', isError)
        document.querySelector(`#${this.#id} *[name="log"]`).style.display = isError ? 'block' : 'none';
        document.querySelector(`#${this.#id} *[name="result"]`).style.display = isError ? 'none' : 'block';
//        document.querySelector(`#web-editor-${this._idNo} *[name="log"]`).style.display = isError ? 'block' : 'none';
//        document.querySelector(`#web-editor-${this._idNo} *[name="result"]`).style.display = isError ? 'none' : 'block';
    }
    */
    #switchResult(name='result') {
        console.log('switchResult:', name);
        'log result document'.split(' ').map(n=>{if(n!==this._resultName){document.querySelector(`#${this.#id} *[name="${n}"]`).style.display = 'none'}});
        document.querySelector(`#${this.#id} *[name="${this._resultName}"]`).style.display = 'block';
//        document.querySelector(`#${this.#id} *[name="log"]`).style.display = isError ? 'block' : 'none';
//        document.querySelector(`#${this.#id} *[name="result"]`).style.display = isError ? 'none' : 'block';
//        document.querySelector(`#${this.#id} *[name="document"]`).style.display = isError ? 'none' : 'block';
//        document.querySelector(`#web-editor-${this._idNo} *[name="log"]`).style.display = isError ? 'block' : 'none';
//        document.querySelector(`#web-editor-${this._idNo} *[name="result"]`).style.display = isError ? 'none' : 'block';
    }

    /*
    #log(...args) {document.querySelector(`#web-editor-${this._idNo} *[name="log"]`).value += [...args].join(' ');}
    #assert(...args) {
        this._assert.count++;
        if ('boolean'!==typeof args[0]){throw new TypeError(`console.assert()の引数は真偽値であるべきです。`)}
        document.querySelector(`#web-editor-${this._idNo} *[name="log"]`).value += `Assertion failed\n`;
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
