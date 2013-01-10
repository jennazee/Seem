$('document').ready(function(){

var seemed = $('#seam-viewer')[0];

$('#pic-up').change(function(){
    var img = new Image();
    var reader = new FileReader();
    reader.onload = function (e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(this.files[0]);
    img.onload = function() {
        seemed.height = img.height;
        seemed.width = img.width;
        $('#slider').attr('max', img.width)
        seemed.getContext('2d').drawImage(img,0,0);
    };
});
   
});