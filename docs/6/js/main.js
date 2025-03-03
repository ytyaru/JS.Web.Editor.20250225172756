window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    document.querySelector('#color-scheme').addEventListener('input', async(e)=>{
        const colors = {
            light: {b:'#FFFFFF', f:'#000000',
                selection:{b:'#4488FF', f:'#FFFFFF'},
                a:{link:'#0000AA', visited:'#AA00AA', hover:'#0000FF', active:'#00FFFF', focus:'#0000FF'},
            },
            smoke: {b:'#DDDDDD', f:'#000000',
                selection:{b:'#4488FF', f:'#FFFFFF'},
                a:{link:'#0000AA', visited:'#AA00AA', hover:'#0000FF', active:'#00FFFF', focus:'#0000FF'},
            },
            dark: {b:'#000000', f:'#FFFFFF',
                //selection:{b:'#FF8844', f:'#FFFFFF'},
                selection:{b:'#FFFF44', f:'#000000'},
                a:{link:'#AAAA00', visited:'#00FF00', hover:'#FFFF00', active:'#FF0000', focus:'#FFFF00'},
            },
        }
        console.log(e.target.value)
        const C = colors[e.target.value];
        const R = document.querySelector(':root');
        R.style.setProperty('--color-fore', C.f);
        R.style.setProperty('--color-back', C.b);
        R.style.setProperty('--color-fore-select', C.selection.f);
        R.style.setProperty('--color-back-select', C.selection.b);
        R.style.setProperty('--color-a-link', C.a.link);
        R.style.setProperty('--color-a-visited', C.a.visited);
        R.style.setProperty('--color-a-hover', C.a.hover);
        R.style.setProperty('--color-a-active', C.a.active);
        R.style.setProperty('--color-a-focus', C.a.focus);
        console.log('--color-select-back:', getComputedStyle(R).getPropertyValue('--color-select-back'))
        // hljsのCSS切替
        if ('dark'===e.target.value) {
            document.querySelector(`link[title="light"]`).disabled = true;
            document.querySelector(`link[title="dark"]`).disabled = false;
        } else {
            document.querySelector(`link[title="light"]`).disabled = false;
            document.querySelector(`link[title="dark"]`).disabled = true;
        }
    });

    const editor1 = new Editor({width:'100%', height:300, q:'#editor-0'});
    const editor2 = new Editor({width:'50%', height:300, q:'#editor-1'});
    const editor3 = new Editor({width:'100%', height:300, q:'#editor-2', result:{target:'log res doc',method:'switch'}});
    const editor4 = new Editor({width:'50%', height:300, q:'#editor-3', row:2});
    const editor5 = new Editor({width:'100%', height:300, q:'#editor-4', row:2, result:{target:'log res doc',method:'switch'}});
    const editor6 = new Editor({width:'100%', height:300, q:'#editor-5', row:2, result:{target:'log res',method:'show'}});

    document.querySelector('#color-scheme').focus();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

