// import 'babel-polyfill';
import {dataString} from "./storage.js";
// import rangesliderJs from 'rangeslider-js';

let state = {
    pvh: {
        price: undefined,
        minWidth: 0,
        maxWidth: 10,
        minHeight: 0,
        maxHeight: 10,
    },
    figure: {
        price: undefined,
        minWidth: 0,
        maxWidth: 10,
        minHeight: 0,
        maxHeight: 10,
    },
    carcass: {
        price: undefined,
        minWidth: 0,
        maxWidth: 10,
        minHeight: 0,
        maxHeight: 10,
    },
    film: {
        price: undefined,
        minWidth: 0,
        maxWidth: 10,
        minHeight: 0,
        maxHeight: 10,
    },
    totalCost: 0
}

const buttonPodlozhka = document.getElementById('podlozhka_active');
const podlozhkaCalculator = document.getElementById('podlozhka_more');
const widthRangeInput = document.getElementById('podlozhka_width_range');
const widthNumberInput = document.getElementById('podlozhka_width_input');
const heightRangeInput = document.getElementById('podlozhka_height_range');
const heightNumberInput = document.getElementById('podlozhka_height_input');
const checkboxPvh = document.getElementById('podlozhka_radio_0');
const checkboxFigure = document.getElementById('podlozhka_radio_1');
const checkboxCarcass = document.getElementById('podlozhka_carcass');
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
    return parsed
}

function initPodlozhkaCalc() {
    checkboxPvh.click();

    rangesliderJs.create(widthRangeInput, {
        min: state.pvh.minWidth || 20,
        max: state.pvh.maxWidth || 500,
        value: 50,
        step: 1,
        onSlide: (value) => handlerWidthRangeInput(value)
    });
    rangesliderJs.create(heightRangeInput, {
        min: state.pvh.minHeight || 20,
        max: state.pvh.maxHeight || 500,
        value: 50,
        step: 1,
        onSlide: (value) => handlerHeightRangeInput(value)
    });
    addTooltips()
}

buttonPodlozhka.addEventListener('click', () => {
    podlozhkaCalculator.classList.toggle('active');
    if (!buttonPodlozhka.checked) {
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
widthNumberInput.addEventListener('input', e => handlerWidthInputNumber(e.target.value))
heightNumberInput.addEventListener('input', e => handlerHeightInputNumber(e.target.value))
checkboxPvh.addEventListener('change', e => handlerCheckbox(e, 'pvh'))
checkboxFigure.addEventListener('change', e => handlerCheckbox(e, 'figure'))
checkboxCarcass.addEventListener('change', e => handlerCheckbox(e, 'carcass'))
checkboxFilm.addEventListener('change', e => handlerCheckbox(e, 'film'))

function handlerCheckbox(event, name) {
    if (!state[name].price) {
        // getPriceString(event.target.dataset.source)
        //     .then(res => setUpPrice(parseResponseString(res), name));
        setUpPrice(parseResponseString(dataString), name);
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
    if (value > state.pvh.maxWidth ) value = state.pvh.maxWidth;
    if (!value || value < state.pvh.minWidth) value = state.pvh.minWidth;
    widthRangeInput['rangeslider-js'].update({ value: value });
    handlerWidthRangeInput(value)
}
function handlerHeightInputNumber(value) {
    if (value > state.pvh.maxHeight ) value = state.pvh.maxHeight;
    if (!value || value < state.pvh.minHeight) value = state.pvh.minHeight;
    heightRangeInput['rangeslider-js'].update({ value: value });
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
}

function calculatePodlozhka() {
    let totalCost = 0
    checkboxPvh.checked ? totalCost += findPrice('pvh') : null;
    checkboxFigure.checked ? totalCost += findPrice('figure') : null;
    checkboxCarcass.checked ? totalCost += findPrice('carcass') : null;
    checkboxFilm.checked ? totalCost += findPrice('film') : null;
    state.totalCost = totalCost;
    printCost();
    fillCallbackForm();
}

function fillCallbackForm() {
    // callbackInputType.value = checkboxPvh.checked ? 'ПВХ и акрил' : 'Фигурный';
    // callbackInputWidth.value = widthRangeInput.value;
    // callbackInputHeight.value = heightRangeInput.value;
    // callbackInputFrame.value = checkboxCarcass.checked ? 'Да' : 'Нет';
    // callbackInputFilm.value = checkboxFilm.checked ? 'Да' : 'Нет';
    // callbackInputSum.value = state.totalCost;
}

function findPrice(priceName = '') {
    return state[priceName]?.price?.find(({width, height}) => {
        return width >= widthRangeInput.value && height >= heightRangeInput.value
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
    const lettersCost = document.getElementById('print__let__sum').textContent;
    costOverallOutput.textContent = (parseInt(lettersCost.replace(/\s+/g, '')) + parseInt(state.totalCost)).toString();
    costPodlozhkaOutput.textContent = state.totalCost;
}

initPodlozhkaCalc()
