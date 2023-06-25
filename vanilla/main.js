document.addEventListener('DOMContentLoaded', () => {
    const groupTrip = document.querySelector('.calc-mr__group_trip');
    const groupFilm = document.querySelector('.calc-mr__group_film');
    const groupBanner = document.querySelector('.calc-mr__group_banner');
    const groupCorob = document.querySelector('.calc-mr__group_corob');
    const groupLightLetters = document.querySelector('.calc-mr__group_light-letters');
    const groupMore = document.querySelector('.calc-mr__group_more');
    const groupSpectech = document.querySelector('.calc-mr__group_spectech');

    const groupsArr = [
        groupFilm,
        groupBanner,
        groupCorob,
        groupLightLetters,
        groupMore,
        groupSpectech
    ];
    const tripCheckboxesArr = [
        document.getElementById('vyezd_na_obekt'),
        document.getElementById('vyezd_zabor_rk'),
        document.getElementById('vyezd_proizvobmerov'),
        document.getElementById('vyezd_diagnostika'),
    ];
    const selectsArr = document.querySelectorAll('.select__wrapper select');

    const tripCost = parseInt(document.getElementById('vyezd_na_obekt').dataset?.price) || 0;
    let stateTripCost = tripCost;

    //* Хэндлеры для всех категорий, кроме "Выезды"
    groupsArr.forEach(group => {
        //* Проверяем, является ли элемент узлом DOM-дерева, чтоб не упало при вызове .querySelector у undefined
        if (!(group instanceof HTMLElement)) return;

        //* Хэндлеры чекбоксов ценовых позиций ('.calc-mr__row')
        group.querySelectorAll('.checkbox_big-round input')
            .forEach(checkbox => checkbox.addEventListener('change', () => {
                handlerPriceRow({
                    rowDiv: checkbox.closest('.calc-mr__row'),
                    rowCheckbox: checkbox,
                })
            }));

        //* Хэндлеры инпутов внутри ценовой позиции
        group.querySelectorAll('.counter__input')
            .forEach(counter => counter.addEventListener('input', () => {
                const rowDiv = counter.closest('.calc-mr__row');
                const rowCheckbox = rowDiv.querySelector('.checkbox_big-round input');

                if (rowCheckbox?.checked) {
                    handlerPriceRow({rowDiv, rowCheckbox})
                }
            }));

        //* Хэндлеры селектов внутри ценовых позиции
        group.querySelectorAll('.calc-mr__price-positions select')
            .forEach(select => select.addEventListener('change', () => {
                const rowDiv = select.closest('.calc-mr__row');
                const rowCheckbox = rowDiv.querySelector('.checkbox_big-round input');

                if (rowCheckbox?.checked) {
                    handlerPriceRow({rowDiv, rowCheckbox})
                }
            }))

        //* Хэндлер селекта с повышающим коэффициентом в шапке группы цен '.calc-mr__group'.
        group.querySelector('.select__coefficient')?.addEventListener('change', () => {
            group.querySelectorAll('.calc-mr__row')
                .forEach(rowDiv => {
                    const rowCheckbox = rowDiv.querySelector('.checkbox_big-round input');

                    if (rowCheckbox?.checked) {
                        handlerPriceRow({rowDiv, rowCheckbox})
                    }
                })
        })
    })

    //* Хэндлеры категории "Выезды" (без "Ремонт вывески")
    tripCheckboxesArr.forEach(checkbox => {
        const rowDiv = checkbox.closest('.calc-mr__row');

        checkbox.addEventListener('change', () => {
            handlerPriceRowTripGroup({ rowDiv, rowCheckbox: checkbox})
        })

        rowDiv.querySelector('.counter__input')?.addEventListener('input', () => {
            if (checkbox.checked) {
                handlerPriceRowTripGroup({rowDiv, rowCheckbox: checkbox})
            }
        })

        rowDiv.querySelector('.select__hours')?.addEventListener('change', () => {
            if (checkbox.checked) {
                handlerPriceRowTripGroup({rowDiv, rowCheckbox: checkbox})
            }
        })
    })

    //* Хэндлеры ценовой позиции "Ремонт вывески" категории "Выезды"
    function initRemontVyveskiHandlers() {
        const checkbox = document.getElementById('remont_vyveski');
        const rowDiv = checkbox.closest('.calc-mr__row');

        checkbox.addEventListener('change', () => {
            handlerPriceRow({ rowDiv, rowCheckbox: checkbox})
        })
        rowDiv.querySelector('.select__hours')?.addEventListener('change', () => {
            if (checkbox.checked) {
                handlerPriceRow({rowDiv, rowCheckbox: checkbox})
            }
        })
    }
    initRemontVyveskiHandlers();

    //* Запускаем плагин кастомных селектов
    selectsArr.forEach(select => new Choices(select, {
        searchEnabled: false,
        itemSelectText: '',
        allowHTML: false,
        shouldSort: false
    }));

    function getDatasetPrice(element) {
        if ("priceMax" in element.dataset) {
            return (parseInt(element.dataset.price) + parseInt(element.dataset.priceMax)) / 2
        }
        return element.dataset.price
    }

    function setStateTripCost() {
        if (!tripCheckboxesArr.some(checkbox => checkbox.checked)) {
            stateTripCost = tripCost;
        }
    }

    function handlerPriceRowTripGroup({rowDiv, rowCheckbox}) {
        const priceOutput = rowDiv.querySelector('.span-price');

        if (!rowCheckbox.checked) {
            priceOutput.textContent = 0;

            setStateTripCost();
            calculatePriceGroupSum(rowDiv);

            return
        }

        const price = rowCheckbox.dataset.price;
        const myTripCost = rowCheckbox.dataset.addTrip
            ? tripCost
            : 0;
        const amountTrips = rowDiv.querySelector('.counter__wrapper.counter_trip .counter__input')
            ? rowDiv.querySelector('.counter__input').value
            : 1;
        const hours = rowDiv.querySelector('.select__hours')
            ? rowDiv.querySelector('.select__hours').value
            : 1;

        priceOutput.textContent = ((price * hours + myTripCost) * amountTrips);
        stateTripCost = 0;

        calculatePriceGroupSum(rowDiv);
    }

    function handlerPriceRow({rowDiv, rowCheckbox}) {
        const priceOutput = rowDiv.querySelector('.span-price');

        if (!rowCheckbox.checked) {
            priceOutput.textContent = 0;
            calculatePriceGroupSum(rowDiv);

            return
        }

        const price = getDatasetPrice(rowCheckbox);
        //* Если у чекбокса имеется атрибут data-add-trip, то добавляем к стоимости цену выезда
        const myTripCost = rowCheckbox.dataset.addTrip
            ? stateTripCost
            : 0;
        //* amountTrips - Количество выездов
        const amountTrips = rowDiv.querySelector('.counter__wrapper.counter_trip .counter__input')
            ? rowDiv.querySelector('.counter__input').value
            : 1;
        //* amount - Выбираем счётчики, которые НЕ счётчики блоков и НЕ счётчики выездов
        const amount = rowDiv.querySelector('.counter__wrapper:not(.counter_trip, .sufx_block) .counter__input')
            ? rowDiv.querySelector('.counter__input').value
            : 1;
        //* blocks количество блоков (в одном блоке 3кв.м)
        const blocks = rowDiv.querySelector('.counter__wrapper.sufx_block .counter__input')
            ? (rowDiv.querySelector('.counter__input').value * 3)
            : 1;
        const hours = rowDiv.querySelector('.select__hours')
            ? rowDiv.querySelector('.select__hours').value
            : 1;
        const labourShift = rowDiv.querySelector('.select__smena')
            ? rowDiv.querySelector('.select__smena').value
            : 1;
        const increasingCoefficient = rowCheckbox.dataset.coefficient
            ? parseFloat(rowDiv.closest('.calc-mr__group').querySelector('.select__coefficient').value)
            : 1;

        priceOutput.textContent = ((price * hours * amount * blocks * labourShift * increasingCoefficient + myTripCost) * amountTrips);

        calculatePriceGroupSum(rowDiv);
    }

    function calculatePriceGroupSum(groupInnerElement) {
        const group = groupInnerElement.closest('.calc-mr__group');
        const groupSumOutput = group.querySelector('.calc-mr__group__footer .span-price');

        let sum = 0;
        group.querySelectorAll('.calc-mr__price-positions .span-price')
            .forEach(spanPrice => sum += parseInt(spanPrice.textContent));

        groupSumOutput.textContent = sum.toString();

        calculateTotalSum()
    }

    function calculateTotalSum() {
        const totalOutput = document.getElementById('total_sum_mr');

        let sum = 0;
        document.querySelectorAll('.calc-mr__group__footer .span-price')
            .forEach(spanPrice => sum += parseInt(spanPrice.textContent));

        totalOutput.textContent = sum.toString();
    }

    /**
     * Обработчик кнопок +/- у числовых инпутов в указанной обёртке
     * @param wrappersArr - HTMLCollection элементов-обёрток (в д/случае .counter__wrapper)
     */

    addInputNumberControls(document.querySelectorAll('.calc-mr .counter__wrapper'));

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


