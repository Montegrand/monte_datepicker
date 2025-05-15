// forEach polyfill
if(window.NodeList && !NodeList.prototype.forEach){
    NodeList.prototype.forEach = Array.prototype.forEach;
};
// closest polyfill
if (!Element.prototype.closest) {
    Element.prototype.closest = function(selector){
        var el = this;
        while(el){
            if (el.matches(selector)) return el;
            el = el.parentElement;
        };
        return null;
    };
};

if(window.jQuery){
    $.fn.monte_datepicker = function(opt){
        return this.each(function(){
            MonteDatepick(this, opt);
        });
    };
};

HTMLElement.prototype.monte_datepicker = function(opt){
    MonteDatepick(this, opt);
};

function MonteDatepick(ele, option){
    option = option || {};
    var isjQuery = typeof jQuery !== 'undefined' && ele instanceof jQuery;
    var _this = _this = isjQuery ? ele[0] : ele,
        settings = {
            dateFormat: option.dateFormat || 'yyyy-mm-dd',
            classNm: {
                areaClass: option.areaClass || 'monte-calendar-area',
                wrapClass: option.wrapClass || 'calendar-wrap',
                headClass: option.headClass || 'calendar-head',
                bodyClass: option.bodyClass || 'calendar-body',
                footerClass: option.footerClass || 'calendar-footer'
            },
            yearRange: option.yearRange || 20,
            days: option.days || ['일','월','화','수','목','금','토'],
        };

    settings.dateDeli = settings.dateFormat.replace(/[ymd]/g,'').charAt(0) || '-';

    _this.calendar = {
        selectDate: []
    };

    _this.$ele = {
        input: _this.querySelectorAll('input'),
        btn: _this.querySelector('button'),
        $area: null,
    };

    _this.$ele.input.forEach(function(input){
        var isBack = false;
        input.addEventListener('keydown',function(e){
            if(e.which == 8) isBack = true;
        });
        input.addEventListener('input',function(evt){
            if(isBack) return isBack = false;
            if(input.value.length > settings.dateFormat.length) return input.value = input.value.slice(0,settings.dateFormat.length)

            var val = '';
            var inputVal = input.value.replace(/[^0-9]/g,'');

            if(inputVal){
                inputVal.split('').forEach(function(char,idx){
                    val = val+char;
                    if(!/[ymd]/.test(settings.dateFormat[val.length])) val = val+settings.dateDeli;
                });
            };

            var valArr = val.split(settings.dateDeli);

            if(valArr[1] && valArr[1]>12){
                window.alert('"월"은 최대 12월 을 넘길 수 없습니다.');
                valArr.pop();
                valArr.pop();
                val = valArr.join(settings.dateDeli);
                return input.value = val;
            };
            if(valArr[2]){
                var maxDate = new Date(valArr[0], valArr[1],0).getDate();
                if(valArr[2] > maxDate){
                    window.alert(valArr[1]+'월의 일수를 초과하였습니다.');
                    valArr.pop();
                    val = valArr.join(settings.dateDeli);
                    return input.value = val;
                };
            };

            return input.value = val;
        });
    });

    _this.$ele.btn.addEventListener('click',function(){
        if(_this.$ele.$area) return;
        init();
    });

    document.addEventListener('click',function(evt){
        setTimeout(function(){
            var focusEle = evt.target;
            while(focusEle){
                if(focusEle == _this.$ele.$area || focusEle == _this){
                    return;
                };
                focusEle = focusEle.parentElement;
            };
            if(_this.$ele.$area) Clear();
        });
    });

    window.addEventListener('resize',function(){
        Position();
    });
    window.addEventListener('scroll',function(){
        Position();
    });

    _this.classList.add('neo-datepicker-wrap');

    function init(){
        var date = new Date();

        date.setHours(0,0,0,0);

        _this.calendar.selectDate = Array.from(_this.$ele.input).map(function(input){return input.value || null});
        _this.calendar.selectDate = _this.calendar.selectDate.filter(Boolean);

        _this.year = _this.year || date.getFullYear();
        _this.month = _this.month || date.getMonth();

        var $area = document.createElement('div'),
            $wrap = document.createElement('div'),
            $head = document.createElement('div'),
            $body = document.createElement('div'),
            $footer = document.createElement('div');

        // area
        $area.className = settings.classNm.areaClass;
        $area.style.opacity = '0';

        // wrap
        $wrap.className = settings.classNm.wrapClass;

        // head
        $head.className = settings.classNm.headClass;
        var headHtml = '    <button type="button" class="btn-cal-move prev">이전 달</button>\n'+
                       '        <div class="calendar-switch-wrap">\n'+
                       '            <div class="calendar-drop-down">\n'+
                       '                <button type="button" class="btn-cal-switch year" title="연도 선택 열기">'+_this.year+'년</button>\n'+
                       '                <div class="calendar-select calendar-year-wrap">\n'+
                       '                    <ul class="sel year"></ul>\n'+
                       '                </div>\n'+
                       '            </div>\n'+
                       '            <div class="calendar-drop-down">\n'+
                       '                <button type="button" class="btn-cal-switch month" title="월 선택 열기">'+('0'+(_this.month+1)).slice(-2)+'월</button>\n'+
                       '                <div class="calendar-select calendar-month-wrap">\n'+
                       '                    <ul class="sel mon">\n'+
                       '                        <li><button type="button" data-month="0">1월</button></li>\n'+
                       '                        <li><button type="button" data-month="1">2월</button></li>\n'+
                       '                        <li><button type="button" data-month="2">3월</button></li>\n'+
                       '                        <li><button type="button" data-month="3">4월</button></li>\n'+
                       '                        <li><button type="button" data-month="4">5월</button></li>\n'+
                       '                        <li><button type="button" data-month="5">6월</button></li>\n'+
                       '                        <li><button type="button" data-month="6">7월</button></li>\n'+
                       '                        <li><button type="button" data-month="7">8월</button></li>\n'+
                       '                        <li><button type="button" data-month="8">9월</button></li>\n'+
                       '                        <li><button type="button" data-month="9">10월</button></li>\n'+
                       '                        <li><button type="button" data-month="10">11월</button></li>\n'+
                       '                        <li><button type="button" data-month="11">12월</button></li>\n'+
                       '                    </ul>\n'+
                       '                </div>\n'+
                       '            </div>\n'+
                       '        </div>\n'+
                       '    <button type="button" class="btn-cal-move next">다음 달</button>';
        $head.innerHTML = headHtml;
        var $selYear = $head.querySelector('.sel.year');

        for(var i=0;i<=settings.yearRange*2;i++){
            var $li = document.createElement('li'),
                thisYear = _this.year - settings.yearRange + i;
            $li.innerHTML = '<button type="button" data-year="'+thisYear+'">'+(_this.year - settings.yearRange + i)+'년</button>';
            if(thisYear == _this.year) $li.classList.add('active');
            $selYear.appendChild($li);
        };

        $head.querySelectorAll('.sel.mon li')[_this.month].classList.add('active');

        var $btnMoveMon = $head.querySelectorAll('.btn-cal-move');

        $btnMoveMon.forEach(function(btn){
            var $year = $head.querySelector('.btn-cal-switch.year'),
                $month = $head.querySelector('.btn-cal-switch.month');

            btn.addEventListener('click',function(){
                if(btn.classList.contains('prev')){
                    _this.month--;
                    if(_this.month<0){
                        _this.year--;
                        _this.month = 11;
                    };
                };
                if(btn.classList.contains('next')){
                _this.month++;
                    if(_this.month>11){
                        _this.year++;
                        _this.month = 0;
                    };
                };
                $year.textContent = _this.year+'년';
                $month.textContent = ('0'+(_this.month+1)).slice(-2)+'월';
                CallCalendar();
            });
        });

        var $switchBtn = $head.querySelectorAll('.btn-cal-switch');

        $switchBtn.forEach(function(btn){
            btn.addEventListener('click',function(){
                var $selWrap = btn.nextElementSibling,
                    tit = btn.getAttribute('title'),
                    active = $selWrap.classList.contains('active');

                if(active){
                    $selWrap.classList.remove('active');
                    btn.setAttribute('title',tit.replace('닫기','열기'));
                }else{
                    $switchBtn.forEach(function(ele){
                        ele.nextElementSibling.classList.remove('active');
                        ele.setAttribute('title',tit.replace('닫기','열기'));
                    });
                    $selWrap.classList.add('active');
                    btn.setAttribute('title',tit.replace('열기','닫기'));
                    setTimeout(function(){
                        $selWrap.querySelector('button').focus();
                    },50);
                };

            });
        });

        $head.querySelectorAll('[data-year],[data-month]').forEach(function(btn){
            var $year = $head.querySelector('.btn-cal-switch.year'),
                $month = $head.querySelector('.btn-cal-switch.month');
            btn.addEventListener('click',function(){
                var $selWrap = btn.closest('.calendar-select'),
                    $selBtn = $selWrap.previousElementSibling,
                    tit = $selBtn.getAttribute('title');

                _this.year = btn.dataset.year ? parseInt(btn.dataset.year) : _this.year;
                _this.month = btn.dataset.month ? parseInt(btn.dataset.month) : _this.month;
                $year.textContent = _this.year+'년';
                $month.textContent = ('0'+(_this.month+1)).slice(-2)+'월';
                $selBtn.setAttribute('title',tit.replace('닫기','열기'));
                $selWrap.classList.remove('active');
                CallCalendar();
                setTimeout(function(){
                    $selBtn.focus();
                });
            });
        });

        // body
        $body.className = settings.classNm.bodyClass;
        CallCalendar();

        // footer
        $footer.className = settings.classNm.footerClass;
        $footer.innerHTML = '    <div class="calendar-btn-wrap">\n'+
                            '        <button type="button" class="footer-btn today">오늘</button>\n'+
                            '        <button type="button" class="footer-btn tertiary">취소</button>\n'+
                            '        <button type="button" class="footer-btn primary">확인</button>\n'+
                            '    </div>\n';

        var $today = $footer.querySelector('button.today'),
            $closeBtn = $footer.querySelector('button.tertiary'),
            $primary = $footer.querySelector('button.primary');

        $today.addEventListener('click',function(){
            var $year = $head.querySelector('.btn-cal-switch.year'),
                $month = $head.querySelector('.btn-cal-switch.month'),
                today = new Date();

            today.setHours(0,0,0,0);

            _this.year = today.getFullYear();
            _this.month = today.getMonth();
            $year.textContent = _this.year+'년';
            $month.textContent = ('0'+(_this.month+1)).slice(-2)+'월';
            CallCalendar();
            $area.querySelectorAll('table button').forEach(function(btn){
                var thisDate = new Date(btn.getAttribute('data-pick-date'));
                thisDate.setHours(0,0,0,0);
                btn.closest('td').className = '';
                btn.removeAttribute('title');
                if(!(today.getTime() == thisDate.getTime())) return;
                _this.calendar.selectDate = [btn.getAttribute('data-pick-date')];
                btn.setAttribute('title','선택됨');
                btn.closest('td').classList.add('selectDate', 'today');
            });
        });

        $closeBtn.addEventListener('click',function(){
            Clear();
        });

        $primary.addEventListener('click',function(){
            Primary();
        });


        $wrap.appendChild($head);
        $wrap.appendChild($body);
        $wrap.appendChild($footer);
        $area.appendChild($wrap);
        document.body.appendChild($area);

        _this.$ele.$area = $area;

        setTimeout(function(){
            Position();
            setTimeout(function(){
                $area.style.transition = '.25s ease-in-out';
                $area.style.opacity = 1;
                $area.querySelector('button').focus();
            });

            // focusin
            $area.addEventListener('keydown',function(evt){
                var $allBtn = $area.querySelectorAll('button'),
                    $focusinEle = document.activeElement,
                    allBtnLen = $allBtn.length - 1;

                if(evt.keyCode == 9 && evt.shiftKey && $allBtn[0] == document.activeElement){
                    evt.preventDefault();
                    $allBtn[allBtnLen].focus();
                };
                if(evt.keyCode == 9 && !evt.shiftKey && $allBtn[allBtnLen] == document.activeElement){
                    evt.preventDefault();
                    $allBtn[0].focus();
                };
            });
        });

        function CallCalendar(){
            $body.innerHTML = '';

            var $table = document.createElement('table');

            $table.innerHTML = '    <caption>'+_this.year+'년 '+('0'+(_this.month+1)).slice(-2)+'월 <span class="skip">달력 - '+settings.days.join(', ')+' 별 선택 제공</span></caption>\n'+
                               '    <colgroup>\n'+
                               '        <col />\n'+
                               '        <col />\n'+
                               '        <col />\n'+
                               '        <col />\n'+
                               '        <col />\n'+
                               '        <col />\n'+
                               '        <col />\n'+
                               '    </colgroup>\n'+
                               '    <thead>\n'+
                               '        <tr></tr>\n'+
                               '    </thead>\n'+
                               '    <tbody></tbody>\n';

            settings.days.forEach(function(day){
                var $th = document.createElement('th');
                $th.setAttribute('scope','col');
                $th.innerHTML = day;
                $table.querySelector('thead tr').appendChild($th);
            });

            var fullDate = new Date(_this.year, (_this.month)+1, 0).getDate(),
                count = -1 * (new Date(_this.year, _this.month, 1).getDay() - 1);

            var DatePushEvt = _this.$ele.input.length==2?RangePushEvt:_this.$ele.input.length==1?SinglePushEvt:function(){},
                PickEvt = _this.$ele.input.length==2?RangePickEvt:_this.$ele.input.length==1?SinglePickEvt:function(){};

            while(count<=fullDate){
                var $tr = document.createElement('tr');
                for(var i=0;i<7;i++){
                    var $td = document.createElement('td');
                    if(count<1) $td.classList.add('old');
                    if(count>fullDate) $td.classList.add('next');
                    var thisDate = new Date(_this.year, _this.month, count),
                        formmatDate = FormatDate(settings.dateFormat, thisDate);

                    thisDate.setHours(0,0,0,0);

                    $td.innerHTML = '<button type="button" data-pick-date="'+formmatDate+'">'+thisDate.getDate()+'</button>'

                    if(thisDate.getTime() == date.getTime()) $td.classList.add('today');

                    var $btn = $td.querySelector('button');
                    DatePushEvt($btn);
                    $btn.addEventListener('click',function(){
                        PickEvt(this);
                    });
                    $tr.appendChild($td);
                    count++;
                };
                $table.querySelector('tbody').appendChild($tr);
            };

            $body.appendChild($table);

            function SinglePushEvt(btn){
                if(!_this.calendar.selectDate.length){
                    return;
                }else{
                    var selectDate = _this.calendar.selectDate[0],
                        thisDate = btn.getAttribute('data-pick-date'),
                        $td = btn.closest('td');

                    if(selectDate == thisDate) $td.classList.add('selectDate');
                };
            };
            function RangePushEvt(btn){
                var $td = btn.closest('td'),
                    thisDate = new Date(btn.getAttribute('data-pick-date'));

                thisDate.setHours(0,0,0,0);
                if(_this.calendar.selectDate.length == 2){
                    var startDate = new Date(_this.calendar.selectDate[0]),
                        endDate = new Date(_this.calendar.selectDate[1]);

                    startDate.setHours(0,0,0,0);
                    endDate.setHours(0,0,0,0);

                    if(thisDate.getTime() < startDate.getTime()) return;
                    if(thisDate.getTime() == startDate.getTime()){
                        $td.classList.add('startDate');
                        btn.setAttribute('title','선택됨');
                    };
                    if(startDate.getTime()<thisDate.getTime() && thisDate.getTime() < endDate.getTime()){
                        $td.classList.add('rangeDate');
                        btn.setAttribute('title','선택됨');
                    };
                    if(thisDate.getTime() == endDate.getTime()){
                        $td.classList.add('endDate');
                        btn.setAttribute('title','선택됨');
                    };
                }else if(_this.calendar.selectDate.length == 1){
                    var selectDate = new Date(_this.calendar.selectDate[0]);
                    selectDate.setHours(0,0,0,0);
                    if(thisDate.getTime() == selectDate.getTime()) return $td.classList.add('selectDate');
                };
            };

            if(option.calAfter && typeof option.calAfter == 'function') option.calAfter();
        };
    };

    function Position(){
        if(!_this.$ele.$area) return;
        _this.$ele.$area.style.transition = 'none';
        var _thisOffset = _this.getBoundingClientRect(),
            areaOffset = _this.$ele.$area.getBoundingClientRect(),
            safety = 100;

        _this.$ele.$area.style.top = (window.scrollY + _thisOffset.top + _thisOffset.height + 8) + 'px';
        _this.$ele.$area.style.left = (_thisOffset.left) + 'px';
        _this.$ele.$area.style.right = 'auto';
        if((_thisOffset.left + areaOffset.width + safety) > window.innerWidth){
            _this.$ele.$area.style.left = 'auto';
            _this.$ele.$area.style.right = '24px';
        };
        _this.$ele.$area.style.transition = '.25s ease-in-out';
    };

    function Clear(){
        _this.$ele.input.forEach(function(input, idx){
            _this.calendar.selectDate.splice(idx,1);
            if(input.value) _this.calendar.selectDate.splice(idx,0,input.value);
        });
        if(_this.$ele.$area){
            _this.$ele.$area.style.opacity = 0;
            setTimeout(function(){
                _this.$ele.$area.parentElement.removeChild(_this.$ele.$area);
                _this.$ele.$area = null;
            },250);
        };
        setTimeout(function(){
            _this.$ele.btn.focus();
        });
    };

    function Primary(){
        if(!_this.calendar.selectDate.length) return;
        _this.$ele.input.forEach(function(input, idx){
            if(_this.calendar.selectDate[idx]){
                input.value = _this.calendar.selectDate[idx]
            }else{
                input.value = null;
            };
        });
        _this.$ele.$area.style.opacity = 0;
        setTimeout(function(){
            _this.$ele.$area.parentElement.removeChild(_this.$ele.$area);
            _this.$ele.$area = null;
        },250);
        setTimeout(function(){
            _this.$ele.btn.focus();
        });
    };

    function SinglePickEvt($btn){
        _this.calendar.selectDate = [$btn.getAttribute('data-pick-date')];
        _this.$ele.$area.querySelectorAll('td').forEach(function($td){
            if($td.querySelector('button') == $btn) return $td.classList.add('selectDate');
            $td.classList.remove('selectDate');
        });
    };
    function RangePickEvt($btn){
        if(_this.calendar.selectDate.length==2) _this.calendar.selectDate = [];
        _this.calendar.selectDate.push($btn.getAttribute('data-pick-date'));
        _this.calendar.selectDate = _this.calendar.selectDate.sort(function(a,b){
            return new Date(a) - new Date(b);
        });

        var $selBtn = _this.$ele.$area.querySelectorAll('.'+settings.classNm.bodyClass+' button');

        $selBtn.forEach(function(selBtn){
            selBtn.closest('td').classList.remove('startDate', 'endDate', 'rangeDate', 'selectDate')
        });

        if(_this.calendar.selectDate.length==2){
            var startDate = new Date(_this.calendar.selectDate[0]).getTime(),
                endDate = new Date(_this.calendar.selectDate[1]).getTime();
            $selBtn.forEach(function(selBtn){
                var $td = selBtn.closest('td'),
                    thisDate = new Date(selBtn.getAttribute('data-pick-date')).getTime();

                if(thisDate < startDate) return;
                if(thisDate == startDate){
                    $td.classList.add('startDate');
                    selBtn.setAttribute('title','선택됨');
                };
                if(startDate<thisDate && thisDate < endDate){
                    $td.classList.add('rangeDate');
                    selBtn.setAttribute('title','선택됨');
                };
                if(thisDate == endDate){
                    $td.classList.add('endDate');
                    selBtn.setAttribute('title','선택됨');
                };
            });
        }else if(_this.calendar.selectDate.length==1){
            $selBtn.forEach(function(selBtn){
                selBtn.removeAttribute('title');
            })
            $btn.closest('td').classList.add('selectDate');
            $btn.setAttribute('title','선택됨');
        };
    };

    function FormatDate(format, date){
        var map = {
            yyyy: date.getFullYear(),
            mm: ('0'+(date.getMonth()+1)).slice(-2),
            dd: ('0'+date.getDate()).slice(-2),
        };
        return format.replace(/yyyy|mm|dd/g, function(m){
            return map[m];
        });
    };
};