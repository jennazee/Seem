function SeamCarver() {
    this.seemed = $('#seam-viewer')[0];
    this.seemed_cxt = this.seemed.getContext('2d');

    this.findMean = function(array) {
        var acc = 0;
        for (var i = 0; i < array.length; i++) {
            acc += array[i];
        }
        return acc/array.length;
    };

    this.compare_pixels = function(pix1, pix2) {
        var rDiff = Math.abs(pix1[0]-pix2[0]);
        var gDiff = Math.abs(pix1[1]-pix2[1]);
        var bDiff = Math.abs(pix1[2]-pix2[2]);
        var aDiff = Math.abs(pix1[3]-pix2[3]);
        return rDiff + gDiff + bDiff + aDiff;
    };

    this.make_rep_matrix = function() {
        var arr = Array(this.seemed.height);
        for (var h = 0; h < this.seemed.height; h++) {
            arr[h] = Array(this.seemed.width);
        };
        return arr;
    };

    this.make_im_rep = function() {
        var imdata = this.seemed_cxt.getImageData(0, 0, this.seemed.width, this.seemed.height).data;
        var im_rep = this.make_rep_matrix();
        for (var h = 0; h < this.seemed.height; h++) {
            for (var w = 0; w < this.seemed.width; w++) {
                im_rep[h][w] = [imdata[4*h*this.seemed.width + w*4], imdata[4*h*this.seemed.width + w*4+1], imdata[4*h*this.seemed.width + w*4+2], imdata[4*h*this.seemed.width + w*4+3]];
            }
        }
        return im_rep;
    };

    this.calc_energies = function(im_rep) {
        var energies = this.make_rep_matrix();
        for (var h = 0; h < this.seemed.height; h++) {
            for (var w = 0; w < this.seemed.width; w++) {
                var diffs = [];
                var curr = im_rep[h][w]
                for (var i = -1; i<=1; i++) {
                    for (var j = -1; j<=1; j++){
                        if (h+i < 0 || h+i === this.seemed.height || w+j < 0 || w+j === this.seemed.width) {
                            continue;
                        }

                        else {
                            diffs.push(this.compare_pixels(curr, im_rep[h+i][w+j]));
                        }
                    }
                }
                energies[h][w] = this.findMean(diffs);
            }
        }
        return energies;
    };
};


$('document').ready(function(){
    var sc = new SeamCarver();

    $('#pic-up').change(function(){
        var img = new Image();
        var reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
        img.onload = function() {
            sc.seemed.height = img.height;
            sc.seemed.width = img.width;
            $('#slider').attr('max', img.width);
            $('#slider').css('width', img.width);
            $('#slider').removeClass('hidden');
            sc.seemed_cxt.drawImage(img,0,0);
            sc.calc_energies.call(sc, sc.make_im_rep.call(sc));
        };
        //REFRESH CARVING
    });
   
});