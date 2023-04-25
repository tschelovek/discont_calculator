// import rangesliderJs from 'rangeslider-js';

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
    const callbackInputType = document.getElementById('letter_form_id_podlozhka_type');
    const callbackInputWidth = document.getElementById('letter_form_id_podlozhka_width');
    const callbackInputHeight = document.getElementById('letter_form_id_podlozhka_height');
    const callbackInputFrame = document.getElementById('letter_form_id_podlozhka_opt_frame');
    const callbackInputFilm = document.getElementById('letter_form_id_podlozhka_opt_film');
    const callbackInputSum = document.getElementById('letter_form_id_podlozhka_sum');
    const widthTooltip = document.createElement('div');
    const heightTooltip = document.createElement('div');
    const lettersCalcSumObserver = new MutationObserver(calculatePodlozhka);

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
        if (value > state.pvh.maxWidth) value = state.pvh.maxWidth;
        widthRangeInput['rangeslider-js'].update({value: value});
        handlerWidthRangeInput(value)
    }

    function handlerHeightInputNumber(value) {
        if (value > state.pvh.maxHeight) value = state.pvh.maxHeight;
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
        //         price: data,
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
        costOverallOutput.textContent = (parseInt(lettersCost.replace(/\s+/g, '')) + parseInt(state.totalCost)).toString();
        costPodlozhkaOutput.textContent = state.totalCost;
    }

    buttonPodlozhka.addEventListener('click', () => {
        podlozhkaCalculator.classList.toggle('active');
        if (!widthRangeInput.closest('div').querySelector('.rangeslider')) initPodlozhkaCalc();
        if (buttonPodlozhka.checked) {
            lettersCalcSumObserver.observe(lettersCalculatorCost, {characterData: true, subtree: true, childList: true})
        } else {
            lettersCalcSumObserver.disconnect();
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
        .forEach(checkbox => checkbox.addEventListener('change', () => handlerCheckbox()))
})
