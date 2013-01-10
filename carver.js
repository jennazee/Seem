var findMean = function(array) {
    var acc = 0;
    for (var i = 0; i < array.length; i++) {
        acc += array[i];
    }
    return acc/array.length;
}

var compare_pixels = function(pix1, pix2) {
    var rDiff = Math.abs(pix1[0]-pix2[0]);
    var gDiff = Math.abs(pix1[1]-pix2[1]);
    var bDiff = Math.abs(pix1[2]-pix2[2]);
    var aDiff = Math.abs(pix1[3]-pix2[3]);
    return rDiff + gDiff + bDiff + aDiff;
};

$('document').ready(function(){

var seemed = $('#seam-viewer')[0];
var seemed_cxt = seemed.getContext('2d')

var calc_imp_matrix = function() {
    var imp_matrix = Array(seemed.height);
    for (var h = 0; h < seemed.height; h++) {
        imp_matrix[h] = Array(seemed.width)
        for (var w = 0; w < seemed.width; w++) {
            var diffs = [];
            var curr = seemed_cxt.getImageData(w,h,1,1);
            for (var i = -1; i<=1; i++) {
                for (var j = -1; j<=1; j++){
                    if (h+i < 0 || h+i === seemed.height || w+j < 0 || w+j === seemed.width) {
                        continue;
                    }

                    else {
                        diffs.push(compare_pixels(curr.data, seemed_cxt.getImageData(w+j,h+i,1,1).data))
                    }
                }
            }
            imp_matrix[h][w] = findMean(diffs)
        }
    }
    console.log(imp_matrix)
};

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
        seemed_cxt.drawImage(img,0,0);
        calc_imp_matrix();
    };
    //REFRESH CARVING
});
   
});