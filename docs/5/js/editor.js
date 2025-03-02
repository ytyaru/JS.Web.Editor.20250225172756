;(function(){
class Editor {
    static #count = 0;
    constructor(options) {
        this._idNo = Editor.#count++;
        this._resultName = 'result';
        this._options = (options && 'object'===typeof options && '[object Object]'===Object.prototype.toString.call(options))
            ? {...this.#defaultOptions, ...options}
            : this.#defaultOptions;
        this._el = this.#makeEditor();
        this.#append();
        this._console = new EditorConsole(this.log);
        this.build();
    }
    get #id() {return this._options.id}
    get el() {return this._el}
    get html() {return this.#ui('html')}
    get css() {return this.#ui('css')}
    get js() {return this.#ui('js')}
    get md() {return this.#ui('md')}
    get log() {return this.#ui('log')}
    get result() {return this.#ui('result')}
    get document() {return this.#ui('document')}
    #ui(name) {return document.querySelector(`#web-editor-${this._idNo} *[name="${name}"]`)}
//    get webgl2() {return this._webgl2;}
    async build() {await this.#build(...this.#allSources)}
    #append() { if (this._options.q) {
        const target = document.querySelector(this._options.q);
        if (!target){throw new TypeError(`次の要素は存在しません：${this._options.q}`)}
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
        md: `# WebEditor

　WebEditorはブラウザ上で任意にHTML,CSS,JSコードを入力し、実行できるエディタです。また、Markdownからドキュメントを生成することもできます。

<pre><code>console.log('Hello JavaScript !!');
alert('Hello JavaScript');
</code></pre>
`, // Markdown
        // 結果表示方法
        result: {
            target: 'log res doc', // log,res,doc を表示したい順と内容で記入する
            method: 'show',        // 'hide'/'show'/'switch'（targetを全部非表示、全部表示、一つずつ表示（クリック等で切替））
        },
    } }
    #init(options) {
        
    }
    #makeEditor() {
        const W = this._options.width;
        const H = this._options.height;
        const width = Number.isInteger(W) ? `${W}px` : W;
        const height = Number.isInteger(H) ? `${H}px` : H;
        return this.#makeLayoutDiv(width, height);
    }
    #getShowSourceCount() {
        const allSrcCnt = this.#textAreaNames.map(k=>this._options[k]).filter(v=>v).length;
        const targets = this._options.result.target.split(' ');
        return (targets.includes('doc') || targets.includes('document'))
            ? allSrcCnt 
            : allSrcCnt - 1; // md を非表示にする
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
//        const srcCnt = this.#textAreaNames.map(k=>this._options[k]).filter(v=>v).length;
        const srcCnt = this.#getShowSourceCount()
        const resCnt = this.#getShowResultCount();
        const count = srcCnt + resCnt;
        return [count, srcCnt, resCnt];
    }
    #calcColRow() {
        const [count, srcCnt, resCnt] = this.#calcShowCount();
        console.log(count, srcCnt, resCnt)
        if (0===count) {throw new TypeError(`少なくともどれか一つは表示してください。`)}
        else if (1===this._options.row) {return [count, 1, -1]}//横一列
        else if (count <= this._options.row) {return [1, count, -1]}//縦一列
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
        console.log(col, row)
        const div = document.createElement('div');
        div.style.cssText = `display:grid;`
             if (1===col && 1 < row) {div.style.cssText += `grid-template-rows:repeat(${row},1fr);`}
        else if (1===row && 1 < col) {div.style.cssText += `grid-template-columns:repeat(${col},1fr);`}
        div.style.cssText += `box-sizing:content-box;padding:0;margin:0;gap:0;`;
        //div.style = `display:grid;grid-template-columns:repeat(${col},1fr);grid-template-rows:repeat(${row},1fr);box-sizing:content-box;padding:0;margin:0;gap:0;`;
        if (width) {div.style.cssText += `;width:${width};`}
        if (height) {div.style.cssText += `;height:${height};`}
        console.log(div.style.cssText)
        return div;
    }
    #makeChildGridLayout(width, height) {
        const [col, row, lastRowCol] = this.#calcColRow();
        console.log(col, row, lastRowCol)
        if (1===row && -1===lastRowCol) {return [this.#makeGridDiv(col, 1)]}//横一列
        if (1===col && -1===lastRowCol) {return [this.#makeGridDiv(1, row)]}//縦一列
        else {
            if (-1===lastRowCol) {return [this.#makeGridDiv(col, row)]}//縦横同数
            else {//縦横の数が異なる
                const divs = [...Array(row)].map(()=>this.#makeGridDiv(col, 1))
                divs.push(this.#makeGridDiv(lastRowCol, 1));
                return divs
            }
        }
    }
    #makeMainGridLayout(children) {
        return 1===children.length
            ? children[0]
            : this.#makeGridDiv(1, children.length)
    }
    #makeLayoutDiv(width, height) {// 画面分割用Div
        console.log(width, height)
        const children = this.#makeChildGridLayout(width, height);
        console.log('children.length:', children.length)
        const main = this.#makeMainGridLayout(children);
        main.id = this.#id;
        console.log(main)
        main.style.cssText += `;width:${width};height:${height};padding:0;margin:0;`//border:solid black 1px;
        console.log(`${main.style.cssText}`)
        console.log(width, height)
        console.log(height)
        if (1===children.length){
            const [col, row, lastRowCol] = this.#calcColRow();
            main.append(...this.#make(width, 1===row ? height : `calc(${height} / ${row});`));
        }
        else {
            const [col, row, lastRowCol] = this.#calcColRow();
            console.log(width);
            console.log(height);
            console.log(width, height);
            //const els = this.#make(width, height);
            const HEIGHT = `calc(${height} / ${row + (-1===lastRowCol ? 0 : 1)})`;
            const els = this.#make(width, HEIGHT);
            console.log(els)
            const elNames = `html css js ${this._options.result.target.split(' ').includes('doc') || this._options.result.target.split(' ').includes('document') ? 'md' : ''} log result ${this._options.result.target.split(' ').includes('doc') || this._options.result.target.split(' ').includes('document') ? 'document' : ''}`.split(' ').filter(v=>v);

            console.log(`col:${col}, row:${row}, lastRowCol:${lastRowCol}`)
            console.log(`elNames:${elNames}`)

            let elId = 0;
            for (let r=0; r<row; r++) {
                for (let c=0; c<col; c++) {
                    console.log(`elId:${elId}`)
//                    els[elId].style.height = HEIGHT;
                    //children[r].appendChild(els[elId])
                    //children[r].appendChild(els.filter(el=>el.name===elNames[elId])[0])
                    children[r].appendChild(els.filter(el=>el.getAttribute('name')===elNames[elId])[0])
                    elId++;
                }
            }
            for (let c=0; c<lastRowCol; c++) {
                console.log(`elId:${elId}`)
//                els[elId].style.height = HEIGHT;
                //children[children.length-1].appendChild(els[elId])
                console.log(elNames[elId], els.filter(el=>el.name===elNames[elId])[0]);
                console.log(elNames[elId], els.filter(el=>el.getAttribute('name')===elNames[elId])[0]);
                //children[children.length-1].appendChild(els.filter(el=>el.name===elNames[elId])[0])
                children[children.length-1].appendChild(els.filter(el=>el.getAttribute('name')===elNames[elId])[0])
                elId++;
            }
            main.append(...children);
        }
        /*
        // 表示ON/OFF
        const targets = this._options.result.target.split(' ');
        if (!targets.includes('log') && !targets.includes('result')) {
            main.querySelector(`*[name="log"]`).style.display = 'none';
        }
        if (!targets.includes('res') && !targets.includes('result')) {
            main.querySelector(`*[name="result"]`).style.display = 'none';
        }
        if (!targets.includes('doc') && !targets.includes('document')) {
            main.querySelector(`*[name="md"]`).style.display = 'none';
            main.querySelector(`*[name="document"]`).style.display = 'none';
        }
        */
        return main;
    }
    #makeLog(width, height, attrs={}){return van.tags.textarea({name:'log', style:`resize:none;box-sizing:content-box;width:100%;height:${height};padding:0;margin:0;`, ...attrs})}
    #makeRes(width, height, attrs={}){console.log(attrs);return van.tags.div({name:'result', style:`box-sizing:content-box;height:${height};padding:0;margin:0;border:1px solid black;overflow:auto;`, ...attrs})}
    #makeDoc(width, height, attrs={}){
        const div = van.tags.div({name:'document', style:`box-sizing:content-box;height:${height};padding:0;margin:0;border:1px solid black;overflow:auto;`, ...attrs});
        div.innerHTML = marked.parse(this._options.md);
        hljs.highlightAll();
        return div;
    }
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
    #make(width='100%', height='99vh') {
        return [
            van.tags.textarea({name:'html',value:this._options.html, style:`resize:none;box-sizing:content-box;height:${height};padding:0;margin:0;`, oninput:async(e)=>await this.#build(...this.#getSource(e,0))}),
            van.tags.textarea({name:'css',value:this._options.css, style:`resize:none;box-sizing:content-box;height:${height};padding:0;margin:0;`, oninput:async(e)=>await this.#build(...this.#getSource(e,1))}),
            van.tags.textarea({name:'js',value:this._options.js, style:`resize:none;box-sizing:content-box;height:${height};padding:0;margin:0;`, oninput:async(e)=>await this.#build(...this.#getSource(e,2))}),
            van.tags.textarea({name:'md',value:this._options.md, style:`resize:none;box-sizing:content-box;height:${height};padding:0;margin:0;`, oninput:async(e)=>{this.document.innerHTML=marked.parse(e.target.value);hljs.highlightAll();}}),
            ...this.#makeResult(width, height),
//            resDiv,
        ];
    }
    get #textAreaNames(){return 'html css js md'.split(' ')}
    get #resultNames(){return 'log result document'.split(' ')}
    //get #allSources(){return this.#textAreaNames.map(name=>document.querySelector(`#${this.#id} *[name="${name}"]`).value)}
    get #allSources(){return 'html css js'.split(' ').map(name=>document.querySelector(`#${this.#id} *[name="${name}"]`).value)}
    #getSource(e, inputNo) {
        if (inputNo < 0 || this.#textAreaNames.length <= inputNo){throw new TypeError(`引数inputNoは0〜${textAreaNames.length-1}の整数であるべきです。`)}
        return this.#textAreaNames.map((name,i)=>i===inputNo ? e.target.value : document.querySelector(`#${this.#id} *[name="${name}"]`).value);
    }
    async #build(htmlCode, cssCode, jsCode) {
        this._console.init();
        document.querySelector(`#${this.#id} *[name="result"]`).innerHTML = `${htmlCode}<style>${cssCode}</style>`;
        try {this.#jsBuild(jsCode);}
        catch(err){this.log.value=err.message}
    }
    #jsBuild(jsCode) {//外部送信禁止（セキュリティ）ただしHTMLで<script>を使いFETCH=fetch;等とされたら対策できない。
        return (new Function('fetch', 'XMLHttpRequest', 'console', 'document', jsCode))(null,null,this._console,this.result);
    }
    #switchResult(name='result') {
        console.log('switchResult:', name);
        this.#resultNames.map(n=>{if(n!==this._resultName){document.querySelector(`#${this.#id} *[name="${n}"]`).style.display = 'none'}});
        document.querySelector(`#${this.#id} *[name="${this._resultName}"]`).style.display = 'block';
    }
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
