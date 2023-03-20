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
console.log(state)

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

document.getElementById('podlozhka_active').addEventListener('click', () => {
    const data = parseResponseString(dataString)
    setUpPrice(data, 'pvh');

    rangesliderJs.create(widthRangeInput, {
        min: state.pvh.minWidth || 20,
        max: state.pvh.maxWidth || 500,
        value: 50,
        step: 1,
        onSlide: (value, percent, position) => widthHandler(value, percent, position)
    });
    rangesliderJs.create(heightRangeInput, {
        min: state.pvh.minHeight || 20,
        max: state.pvh.maxHeight || 500,
        value: 50,
        step: 1,
        onSlide: (value, percent, position) => heightHandler(value, percent, position)
    });
    addTooltips()
})
widthNumberInput.addEventListener('input', e => widthRangeInput['rangeslider-js'].update({value: e.target.value}))
heightNumberInput.addEventListener('input', e => heightRangeInput['rangeslider-js'].update({value: e.target.value}))

checkboxCarcass.addEventListener('change', (e) => {
    if (!state.carcass.price) {
        // const path = e.target.dataset.source;
        // state.carcassPrice = getPriceString(path).then(res => parseResponseString(res));
        const data = parseResponseString(dataString)

        setUpPrice(data, 'carcass');
    }

    // if (minWidth !== state.minWidth || maxWidth !== state.maxWidth) {
    //     state.minWidth = minWidth;
    //     state.maxWidth = maxWidth;
    //     widthRangeInput['rangeslider-js'].update({
    //         min: state.minWidth,
    //         max: state.maxWidth,
    //         value: state.minWidth,
    //     })
    // }
    console.log(state)
    // calculatePodlozhka()
})


function widthHandler(value, percent, position) {
    widthNumberInput.value = value;
    widthTooltip.textContent = value;
    calculatePodlozhka()
}

function heightHandler(value, percent, position) {
    heightNumberInput.value = value;
    heightTooltip.textContent = value;
    calculatePodlozhka()
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
        // widths: [],
        // heights: [],
    })
}

function calculatePodlozhka() {
    let totalCost = 0
    if (checkboxCarcass.checked) {
        // const price = [];
        // state.carcass.price.map((current) => {
        //     if (current.width >= widthRangeInput.value && current.height >= heightRangeInput.value) {
        //         price.push(current)
        //     }
        // })
        totalCost += findPrice('carcass')
    }
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
