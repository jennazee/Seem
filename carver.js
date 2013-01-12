function SeamCarver() {
    this.seemed = $('#seam-viewer')[0];
    this.newpic = $('#new-pic-viewer')[0];
    this.seemed_cxt = this.seemed.getContext('2d');
    this.new_cxt = this.newpic.getContext('2d');

    this.init = function() {
        this.im_rep = this.make_rep_matrix();
        this.energies = this.make_rep_matrix();
        this.directions = this.make_rep_matrix();
        this.costs = this.make_rep_matrix();

        this.seams = Array(this.seemed.width);

        //this.make_im_rep();
        this.imdata = this.seemed_cxt.getImageData(0, 0, this.seemed.width, this.seemed.height).data;
        this.calc_energies();
        this.setCosts();
        this.makeSeamOrder();
    }
    
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
        for (var h = 0; h < this.seemed.height; h++) {
            for (var w = 0; w < this.seemed.width; w++) {
                this.im_rep[h][w] = [imdata[4*h*this.seemed.width + w*4], imdata[4*h*this.seemed.width + w*4+1], imdata[4*h*this.seemed.width + w*4+2], imdata[4*h*this.seemed.width + w*4+3]];
            }
        }
    };

    this.getPixelAt = function(h,w) {
        return [this.imdata[4*h*this.seemed.width + w*4], this.imdata[4*h*this.seemed.width + w*4+1], this.imdata[4*h*this.seemed.width + w*4+2], this.imdata[4*h*this.seemed.width + w*4+3]];
    }

    this.calc_energies = function() {
        for (var h = 0; h < this.seemed.height; h++) {
            for (var w = 0; w < this.seemed.width; w++) {
                var diffs = [];
                var curr = this.getPixelAt(h,w)
                for (var i = -1; i<=1; i++) {
                    for (var j = -1; j<=1; j++){
                        if (h+i < 0 || h+i === this.seemed.height || w+j < 0 || w+j === this.seemed.width) {
                            continue;
                        }

                        else {
                            diffs.push(this.compare_pixels(curr, this.getPixelAt(h+i, w+j)));
                        }
                    }
                }
                this.energies[h][w] = this.findMean(diffs);
            }
        }
    };

    this.findMinDirection = function(i, j) {
        var min = 0;

        if (j === 0) {
            if (this.costs[i-1][j] > this.costs[i-1][j+1]){
                min = 1; //otherwise, stays as default
            }
        }

        else if (j === this.seemed.width - 1){
            if (this.costs[i-1][j] > this.costs[i-1][j-1]){
                min = -1; //otherwise, stays as default
            }
        }
        
        else {
            if (this.costs[i-1][j] > this.costs[i-1][j-1]){
                min = -1;
            }
            //if the value didn't change, were comparing j+0 and j+1
            if (this.costs[i-1][j+min] > this.costs[i-1][j+1]){
                min = 1;
            }
        }
        return min;
    };

    this.setPixCost = function(i, j) {
        if (i === 0) {
            this.costs[0][j] = this.energies[0][j]
            this.directions[0][j] = 0;
        }

        else {
            this.directions[i][j] = this.findMinDirection(i,j);
            this.costs[i][j] = this.energies[i][j] + this.costs[i-1][j+this.directions[i][j]]
        }
    };

    this.setCosts = function() {
        for (var h = 0; h < this.seemed.height; h++) {
            for (var w = 0; w < this.seemed.width; w++) {
                this.setPixCost(h,w)
            }
        }
    };

    this.findLowestCostSeam = function() {
        var min = 0;
        for (var i = 1; i < this.seemed.width; i++) {
            if (this.costs[this.seemed.height-1][i] < this.costs[this.seemed.height-1][min]) {
                min = i;
            }
        }
        return this.findSeamFrom(min);
    }

    this.findSeamFrom = function(index) {
        var seam = Array(this.seemed.height);
        seam[this.seemed.height - 1] = index;
        for (var i = this.seemed.height - 2; i >= 0; i--){
            seam[i]= seam[i+1] + this.directions[i+1][seam[i+1]];
        }
        return seam;
    }

    this.drawSeam = function(seam) {
        this.seemed_cxt.fillStyle = 'red';
        for (var h = 1; h < this.seemed.height; h++) {
            this.seemed_cxt.fillRect(seam[h], h, 1, 1)
        };
    };

    this.drawAllSeams = function(numSeams) {
        for (var s = 0; s <= numSeams; s++) {
            if (this.seams[s] === undefined) {
                this.seams[s] = this.findSeamFrom(this.seamOrder[s])
            }
            this.drawSeam(this.seams[s])
            this.removeSeam(this.seams[s])
        }
    };

    this.removeSeam = function(seam) {
        var newdata = this.new_cxt.getImageData(0, 0, this.newpic.width, this.newpic.height);
        newdata.data = $.extend([undefined], newdata.data).slice(1);
        for (var h = 0; h < seam.length; h++) {
            newdata.data = newdata.data.subarray(0, 4*h*this.seemed.width + seam[h]*4 - h*4 - 1) + newdata.data.subarray(0, 4*h*this.seemed.width + seam[h]*4 - h*4 + 4)
        }
        newdata.data = new Uint8Array(newdata.data)
        this.new_cxt.putImageData(newdata, 0,0)
    };

    this.makeSeamOrder = function() {
        this.seamOrder = [];
        var bottomCosts = $.extend([], this.costs[this.seemed.height-1]);
        var sorted = $.extend([], this.costs[this.seemed.height-1]).sort()
        for (var s = 0; s < this.seemed.width; s++) {
            this.seamOrder.push(bottomCosts.indexOf(sorted[s]))
            bottomCosts[bottomCosts.indexOf(sorted[s])] = null;
        }
    };
};


$('document').ready(function(){
    var sc = new SeamCarver();

    $('#pic-up').change(function(){
        $('#swirly').removeClass('hidden');
        var img = new Image();
        var newimg = new Image();
        var reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
            newimg.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
        img.onload = function() {
            sc.seemed.height = img.height;
            sc.seemed.width = img.width;
            sc.newpic.height = newimg.height;
            sc.newpic.width = newimg.width;
            $('#slider').attr('max', img.width);
            $('#slider').css('width', img.width);
            $('#carvepad').css('width', img.width*2+40);
            $('#pic-manip').css('width', img.width);
            $('#new').css('width', newimg.width);
            $('#slider').removeClass('hidden');
            $('#swirly').addClass('hidden');
            sc.seemed_cxt.drawImage(img,0,0);
            sc.new_cxt.drawImage(newimg,0,0);
            sc.init.call(sc);
        };
        //REFRESH CARVING
    });

    $('#slider').change(function() {
        sc.drawAllSeams.call(sc, $(this).val());
    });
   
});
