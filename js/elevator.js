(function () {
    var CompartmentModel, view;

    CompartmentModel = class CompartmentModel {
        constructor() {
            var buttons, floor, me;
            this.floors = 5;
            this.compartment = [];
            this.compartmentCount = 3;
            me = this;
            buttons = ((function () {
                var j, upDownButtons;
                upDownButtons = [];
                for (floor = j = me.floors; j >= 1; floor = j += -1) {
                    upDownButtons.push(`<div id = 'floor-buttons-${floor}' class='floor-buttons d-flex align-items-center'><div class="floor-number-container d-flex align-items-center justify-content-center"><label class="floor-number-label">${floor}</label></div><button class='button upSide' data-floor='${floor}'><div class='upSide'></div></button><button class='button downSide' data-floor='${floor}'><div class='downSide'></div></button></div>`);
                }
                return upDownButtons;
            })()).join('');
            $('#upDownButtons').empty().append($(buttons)).off('click').on('click', 'button', function () {
                if ($(this).hasClass('on')) {
                    return;
                }
                $(this).toggleClass('on');
                return $(me).trigger('pressed', [
                    {
                        floor: parseInt($(this)[0].dataset.floor),
                        dir: $(this).children().hasClass('upSide') ? 'upSide' : 'downSide'
                    }
                ]);
            });
        }

        clearButton(floor, dir) {
            return $(`#floor-buttons-${floor} > button > div.${dir}`).parent().removeClass('on');
        }

        closestIdleCompartment(floor) {
            var a, compartment, closest, i, lowest, nonmoving;
            nonmoving = (function () {
                var j, len, ref, results;
                ref = this.compartment;
                results = [];
                for (i = j = 0, len = ref.length; j < len; i = ++j) {
                    compartment = ref[i];
                    if (!compartment.moving && !compartment.inMaintenance) {
                        results.push([i + 1, Math.abs(floor - compartment.floor)]);
                    }
                }
                return results;
            }).call(this);
            closest = nonmoving.reduce(function (a, b) {
                if (a[1] <= b[1]) {
                    return a;
                } else {
                    return b;
                }
            });
            lowest = (function () {
                var j, len, results;
                results = [];
                for (j = 0, len = nonmoving.length; j < len; j++) {
                    a = nonmoving[j];
                    if (a[1] === closest[1]) {
                        results.push(a[0]);
                    }
                }
                return results;
            })();
            return lowest[Math.floor(Math.random() * lowest.length)];
        }

        moveCompartment(compartment, floor) {
            var deferred, myCompartment;
            myCompartment = this.compartment;
            deferred = $.Deferred();
            if (this.compartment[compartment - 1].moving) {
                return deferred.reject();
            }
            if (floor < 1 || floor > this.floors) {
                return deferred.reject();
            }
            this.compartment[compartment - 1].moving = true;
            $(`#lift${compartment} .compartment`).animate({
                bottom: `${(floor - 1) * 85}px`
            }, {
                duration: 300 * Math.abs(myCompartment[compartment - 1].floor - floor),
                easing: 'linear',
                complete: function () {
                    myCompartment[compartment - 1].floor = floor;
                    myCompartment[compartment - 1].moving = false;
                    return deferred.resolve();
                }
            }).delay(50);
            $(`#lift${compartment} .compartment > div`).animate({
                top: `${-425 + floor * 85}px`
            }, {
                duration: 300 * Math.abs(myCompartment[compartment - 1].floor - floor),
                easing: 'linear'
            }).delay(50);
            return deferred;
        }

    };

    view = new CompartmentModel();
    for (let i = 0; i < view.compartmentCount; i++) {
        view.compartment.push({
            floor: 1,
            moving: false,
            inMaintenance: false,
        });
        let count = i;
        dynamicCompartment = `<div id = "lift${count+1}" class="elevator col d-flex justify-content-center"><div class="compartment"><div><div>5</div><div>4</div><div>3</div><div>2</div><div>1</div></div></div></div >`;

        $('#elevators').prepend(dynamicCompartment);

        dynamicMaintenanceMode = `<div class="col d-flex align-content-center justify-content-center maintenance-mode-item"><div class="form-check form-switch cursor-pointer"><input class="form-check-input cursor-pointer" type="checkbox" onchange="toMaintenance(${i})" /></div></div>`;

        $('.maintenance-mode-container').prepend(dynamicMaintenanceMode);
    }

    $(view).on('pressed', function (e, { floor, dir }) {
        return view.moveCompartment(view.closestIdleCompartment(floor), floor).then(function () {
            return view.clearButton(floor, dir);
        });
    });

    toMaintenance = (compartmentNumber) => {
        view.compartment[compartmentNumber].inMaintenance = !view.compartment[compartmentNumber].inMaintenance;
        if (view.compartment[compartmentNumber].inMaintenance) {
            $(`#lift${compartmentNumber+1} > .compartment`).css('border', '2px solid red');
        }
        else {
            $(`#lift${compartmentNumber+1} > .compartment`).css('border', 'none');
        }
        view.moveCompartment(compartmentNumber+1, 1);

        const isAllInMaintenance = view.compartment.every((m) => m.inMaintenance === true);

        isAllInMaintenance ? $('.button').prop('disabled', true) : $('.button').prop('disabled', false);
    }
    
}).call(this);

