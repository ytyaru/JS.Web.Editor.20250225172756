window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    //const editor = new Editor(500,500,'#main');
    const editor1 = new Editor('100%',300,'#editor-0');
    const editor2 = new Editor('50%',300,'#editor-1');
//    await editor1.build();
//    await editor2.build();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

