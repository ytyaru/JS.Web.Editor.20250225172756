window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    const editor1 = new Editor({width:'100%', height:300, q:'#editor-0'});
    const editor2 = new Editor({width:'50%', height:300, q:'#editor-1'});
    const editor3 = new Editor({width:'100%', height:300, q:'#editor-2', result:{target:'log res doc',method:'switch'}});
    const editor4 = new Editor({width:'50%', height:300, q:'#editor-3', row:2});
    const editor5 = new Editor({width:'100%', height:300, q:'#editor-4', row:2, result:{target:'log res doc',method:'switch'}});
    const editor6 = new Editor({width:'100%', height:300, q:'#editor-5', row:2, result:{target:'log res',method:'show'}});
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

