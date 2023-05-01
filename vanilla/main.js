import rangesliderJs from 'rangeslider-js';

document.addEventListener('DOMContentLoaded', () => {
    let state = {
        flat: {
            price: undefined,
            minWidth: 0,
            maxWidth: 10,
            minHeight: 0,
            maxHeight: 10,
        },
        flat_frame: {
            price: undefined,
            minWidth: 0,
            maxWidth: 10,
            minHeight: 0,
            maxHeight: 10,
        },
        flat_film: {
            price: undefined,
            minWidth: 0,
            maxWidth: 10,
            minHeight: 0,
            maxHeight: 10,
        },
        flat_frame_film: {
            price: undefined,
            minWidth: 0,
            maxWidth: 10,
            minHeight: 0,
            maxHeight: 10,
        },
        cassette: {
            price: undefined,
            minWidth: 0,
            maxWidth: 10,
            minHeight: 0,
            maxHeight: 10,
        },
        cassette_frame: {
            price: undefined,
            minWidth: 0,
            maxWidth: 10,
            minHeight: 0,
            maxHeight: 10,
        },
        cassette_film: {
            price: undefined,
            minWidth: 0,
            maxWidth: 10,
            minHeight: 0,
            maxHeight: 10,
        },
        cassette_frame_film: {
            price: undefined,
            minWidth: 0,
            maxWidth: 10,
            minHeight: 0,
            maxHeight: 10,
        },
        // designSum: 0,
        totalCost: 0,
        currentPriceList: '',
    }

    const buttonPodlozhka = document.getElementById('podlozhka_active');
    const lettersCalculatorCost = document.getElementById('print__let__sum');
    const podlozhkaCalculator = document.getElementById('podlozhka_more');
    const widthRangeInput = document.getElementById('podlozhka_width_range');
    const widthNumberInput = document.getElementById('podlozhka_width_input');
    const heightRangeInput = document.getElementById('podlozhka_height_range');
    const heightNumberInput = document.getElementById('podlozhka_height_input');
    const checkboxFlat = document.getElementById('podlozhka_radio_0');
    const checkboxCassette = document.getElementById('podlozhka_radio_1');
    const checkboxFrame = document.getElementById('podlozhka_carcass');
    const checkboxFilm = document.getElementById('podlozhka_film');
    const costPodlozhkaOutput = document.getElementById('podlozhka_cost');
    const costOverallOutput = document.getElementById('leters_podlozhka_cost');
    const callbackInputDesign = document.getElementById('letter_form_id_design_price');
    const callbackInputType = document.getElementById('letter_form_id_podlozhka_type');
    const callbackInputWidth = document.getElementById('letter_form_id_podlozhka_width');
    const callbackInputHeight = document.getElementById('letter_form_id_podlozhka_height');
    const callbackInputFrame = document.getElementById('letter_form_id_podlozhka_opt_frame');
    const callbackInputFilm = document.getElementById('letter_form_id_podlozhka_opt_film');
    const callbackInputSum = document.getElementById('letter_form_id_podlozhka_sum');
    const widthTooltip = document.createElement('div');
    const heightTooltip = document.createElement('div');
    const lettersCalcSumObserver = new MutationObserver(calculatePodlozhka);
    // const lettersCalcSumObserver2 = new MutationObserver(updateLettersCost);
    const observerConfig = {attributes: true, childList: true, subtree: true};

    document.getElementById('test').addEventListener('click', () => lettersCalculatorCost.textContent = '100');

    lettersCalcSumObserver.observe(lettersCalculatorCost, observerConfig)

    function getCleanNumber(string = '') {
        return Number(string.replace(/\s+/g, ''))
    }

    function parseResponseString(string) {
        let parsed = [];
        string.split('|').map(params => {
            let temp = params.split('-');
            parsed.push({
                width: parseInt(temp[0]),
                height: parseInt(temp[1]),
                price: parseFloat(temp[2]),
            })
        })
        return parsed.reverse()
    }

    // function getPriceString(path) {
    //     return fetch(`/udata/custom/readCalc/(${path}).json`, {
    //         method: "GET",
    //         credentials: "same-origin",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //     })
    //         .then(res => res.json())
    //         .then(res => res.result)
    //         .catch(err => console.error(`Не удалось загрузить данные: ${err.message}`))
    // }

    function getPriceString(path) {
        return fetch(path, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(res => res.json())
            .catch(err => console.error(`Не удалось загрузить данные: ${err.message}`))
    }

    function initPodlozhkaCalc() {
        getPriceString(checkboxFlat.dataset.flat)
            .then(res => {

                setUpPrice(parseResponseString(res), 'flat');

                rangesliderJs.create(widthRangeInput, {
                    min: state.flat.minWidth,
                    max: state.flat.maxWidth,
                    value: state.flat.minWidth,
                    step: 1,
                    onInit: (value) => widthNumberInput.value = value,
                    onSlide: (value) => handlerWidthRangeInput(value)
                });
                rangesliderJs.create(heightRangeInput, {
                    min: state.flat.minHeight,
                    max: state.flat.maxHeight,
                    value: state.flat.minHeight,
                    step: 1,
                    onInit: (value) => widthNumberInput.value = value,
                    onSlide: (value) => handlerHeightRangeInput(value)
                });
                addTooltips();

                state.currentPriceList = 'flat';
                checkboxFlat.click();

            })
            .catch(err => console.error(err.message));
    }

    function handlerCheckbox() {
        const priceName = `${checkboxFlat.checked ? 'flat' : 'cassette'}${checkboxFrame.checked ? '_frame' : ''}${checkboxFilm.checked ? '_film' : ''}`
        state.currentPriceList = priceName;

        if (!state[priceName].price) {
            getPriceString(checkboxFlat.dataset[priceName])
                .then(res => {
                    setUpPrice(parseResponseString(res), priceName);
                    calculatePodlozhka();
                })
                .catch(err => console.error(err.message));
            return
        }

        calculatePodlozhka();
    }

    function handlerWidthRangeInput(value) {
        widthNumberInput.value = value;
        widthTooltip.textContent = value;
        calculatePodlozhka();
    }

    function handlerHeightRangeInput(value) {
        heightNumberInput.value = value;
        heightTooltip.textContent = value;
        calculatePodlozhka();
    }

    function handlerWidthInputNumber(value) {
        if (value > state.flat.maxWidth) value = state.flat.maxWidth;
        widthRangeInput['rangeslider-js'].update({value: value});
        handlerWidthRangeInput(value)
    }

    function handlerHeightInputNumber(value) {
        if (value > state.flat.maxHeight) value = state.flat.maxHeight;
        heightRangeInput['rangeslider-js'].update({value: value});
        handlerHeightRangeInput(value)
    }

    function findMinMax(arr, dimension) {
        const arrValues = arr.map(el => {
            return el[dimension]
        })
        return {min: Math.min(...arrValues), max: Math.max(...arrValues)}
    }

    function setUpPrice(data, key) {
        const {min: minWidth, max: maxWidth} = findMinMax(data, 'width');
        const {min: minHeight, max: maxHeight} = findMinMax(data, 'height');

        Object.assign(state[key], {
            price: data,
            minWidth: minWidth,
            maxWidth: maxWidth,
            minHeight: minHeight,
            maxHeight: maxHeight,
        })

        // state = {
        //     ...state,
        //     [key]: {
        //         pr ice: data,
        //         minWidth: minWidth,
        //         maxWidth: maxWidth,
        //         minHeight: minHeight,
        //         maxHeight: maxHeight,
        //     }
        // }
    }

    function calculatePodlozhka() {
        state.totalCost = findPrice(state.currentPriceList);
        printCost();
        fillCallbackForm();
    }

    function fillCallbackForm() {
        if (callbackInputType) callbackInputType.value = checkboxFlat.checked ? 'ПВХ и акрил' : 'Фигурный';
        if (callbackInputWidth) callbackInputWidth.value = widthRangeInput.value;
        if (callbackInputHeight) callbackInputHeight.value = heightRangeInput.value;
        if (callbackInputFrame) callbackInputFrame.value = checkboxFrame.checked ? 'Да' : 'Нет';
        if (callbackInputFilm) callbackInputFilm.value = checkboxFilm.checked ? 'Да' : 'Нет';
        if (callbackInputSum) callbackInputSum.value = state.totalCost;
    }

    function findPrice(priceName = '') {
        return state[priceName]?.price?.find(({width, height}) => {
            return width <= widthRangeInput.value && height <= heightRangeInput.value
        }).price || 0
    }

    function addTooltips() {
        widthRangeInput.closest('div').querySelector('.rangeslider__handle').append(widthTooltip);
        widthTooltip.classList.add('rangeslider__tooltip');
        widthTooltip.textContent = widthRangeInput.value;
        heightRangeInput.closest('div').querySelector('.rangeslider__handle').append(heightTooltip);
        heightTooltip.classList.add('rangeslider__tooltip');
        heightTooltip.textContent = heightRangeInput.value;
    }

    function printCost() {
        const lettersCost = lettersCalculatorCost.textContent;
        costOverallOutput.textContent =
            (parseInt(lettersCost.replace(/\s+/g, '')) + parseInt(state.totalCost)).toString();
        costPodlozhkaOutput.textContent = state.totalCost;
    }

    buttonPodlozhka.addEventListener('click', () => {
        podlozhkaCalculator.classList.toggle('active');
        if (!widthRangeInput.closest('div').querySelector('.rangeslider')) initPodlozhkaCalc();
        if (!buttonPodlozhka.checked) {
            // lettersCalcSumObserver.observe(lettersCalculatorCost, observerConfig)
        // } else {
        //     lettersCalcSumObserver.disconnect();
            podlozhkaCalculator.classList.remove('active');

            [
                callbackInputType,
                callbackInputWidth,
                callbackInputHeight,
                callbackInputFrame,
                callbackInputFilm,
                callbackInputSum,
            ].forEach(input => input.value = '')
        }
    })
    widthNumberInput.addEventListener('input', e => handlerWidthInputNumber(e.target.value));
    heightNumberInput.addEventListener('input', e => handlerHeightInputNumber(e.target.value));
    [checkboxFlat, checkboxFrame, checkboxCassette, checkboxFilm]
        .forEach(checkbox => checkbox.addEventListener('change', () => handlerCheckbox()));


    /**
     * Слайдер "Дизайн"
     *
     */

    const designRangeInput = document.getElementById('letters_design');
    const designPrice = parseInt(designRangeInput.dataset.design_price);
    const designMinutesInterval = parseInt(designRangeInput.dataset.design_interval);
    const designMaxIntervals = parseInt(designRangeInput.dataset.design_amount_intervals);
    const designHint = designRangeInput.closest('div').querySelector('.letters__calc__hint');
    const inputDesignSlider = document.getElementById('letters_design_input');
    const designCostOutput = document.getElementById('print__let__design');

    // lettersCalcSumObserver2.observe(lettersCalculatorCost, observerConfig);
    inputDesignSlider.addEventListener('input', e => {
        const value = e.currentTarget.value;
        if (value > designMaxIntervals) return;

        designRangeInput['rangeslider-js'].update({value: value});
        handlerDesignRangeInput(value)
    });
    rangesliderJs.create(designRangeInput, {
        min: 0,
        max: designMaxIntervals,
        value: 0,
        step: 1,
        onSlide: (value) => handlerDesignRangeInput(value)
    });
    addInputNumberControls(document.querySelectorAll('.letters__calc__design .counter__wrapper'));

    function handlerDesignRangeInput(value) {
        // const lettersCost = getCleanNumber(lettersCalculatorCost.textContent);
        const designCurrentSum = designPrice * value;
        // const subtraction = designCurrentSum - state.designSum;

        inputDesignSlider.value = value;
        designCostOutput.textContent = designCurrentSum.toLocaleString();
        state.designSum = designCurrentSum;
        if (callbackInputDesign) callbackInputDesign.value = designCurrentSum;

        if (value === 0) {
            designHint.textContent = 'Работа дизайнера не требуется'
        } else {
            const minutes = (value * designMinutesInterval) % 60;
            const minutesText = minutes === 0 ? '' : `${minutes} минут `;

            const hours = (value * designMinutesInterval) / 60;
            let hoursText = '';
            if (hours === 1) hoursText = '1 час ';
            if (hours > 1) hoursText = `${Math.floor(hours)}ч `;

            designHint.textContent = `${designCurrentSum} рублей, ${hoursText}${minutesText} работы дизайнера`;
        }

        updateLettersTotalCost()
        // lettersCalcSumObserver2.observe(lettersCalculatorCost, observerConfig)
    }

    function updateLettersCost() {
        // lettersCalcSumObserver2.disconnect();
        // lettersCalculatorCost.textContent =
        //     (parseInt(lettersCalculatorCost.textContent.replace(/\s+/g, '')) + state.designSum).toLocaleString();
        // lettersCalcSumObserver2.observe(lettersCalculatorCost, observerConfig);
    }

    function updateLettersTotalCost() {

    }

    /**
     * Конец слайдера "Дизайн"
     */

    /**
     * Обработчик кнопок +/- у числовых инпутов в указанной обёртке
     * @param wrappersArr - HTMLCollection элементов-обёрток (в д/случае .counter__wrapper)
     */

    addInputNumberControls(document.querySelectorAll('.podlozhka__more .counter__wrapper'))

    function addInputNumberControls(wrappersArr) {
        const event = new InputEvent("input", {
            view: window,
            bubbles: true,
            cancelable: true,
        });

        wrappersArr.forEach(wrapper => {
            const input = wrapper?.querySelector("input[type='number']");

            wrapper?.querySelector('.counter__decrement').addEventListener('click', () => {
                if (input.value > 0) input.stepDown(1);
                input.dispatchEvent(event);
            })
            wrapper?.querySelector('.counter__increment').addEventListener('click', () => {
                input.stepUp(1);
                input.dispatchEvent(event);
            })
        })
    }

    /**
     * Конец обработчика кнопок +/-
     */

})


