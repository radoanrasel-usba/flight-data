document.addEventListener('DOMContentLoaded', function() {
    // --- PAGE & BUTTON DEFINITIONS ---
    const pages = document.querySelectorAll('.page');
    const enterBtn = document.getElementById('enter-btn');
    const departureLdmBtn = document.getElementById('departure-ldm-btn');
    const onlyLdmBtn = document.getElementById('only-ldm-btn');
    const domesticBtn = document.getElementById('domestic-btn');
    const internationalBtn = document.getElementById('international-btn');
    const generateReportBtnIntl = document.getElementById('generate-report-btn-intl');
    const generateReportBtnDom = document.getElementById('generate-report-btn-dom');
    const generateReportBtnLdm = document.getElementById('generate-report-btn-ldm');
    const selectionPreviousBtn = document.getElementById('selection-previous-btn');
    const selectionTypePreviousBtn = document.getElementById('selection-type-previous-btn');
    const dataPreviousBtnIntl = document.getElementById('data-previous-btn-intl');
    const dataPreviousBtnDom = document.getElementById('data-previous-btn-dom');
    const dataPreviousBtnLdm = document.getElementById('data-previous-btn-ldm');
    const reportBackBtn = document.getElementById('report-back-btn');
    const printLeftBtn = document.getElementById('print-left-btn');
    const printRightBtn = document.getElementById('print-right-btn');
    const newReportBtn = document.getElementById('new-report-btn'); 
    
    let lastDataPage = 'identification-page';

    function showPage(pageId) {
        const activePage = document.querySelector('.page.active');
        if (activePage && activePage.id.startsWith('data-input-page') || activePage && activePage.id === 'ldm-input-page') {
            lastDataPage = activePage.id;
        }
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        
        if (pageId === 'data-input-page') setupDataInputPage('intl');
        if (pageId === 'data-input-page-dom') setupDataInputPage('dom');
        if (pageId === 'ldm-input-page') setupDataInputPage('ldm');
    }
    
    // ADDED FUNCTION TO RESET LDM FORM
    function resetLdmForm() {
        const form = document.getElementById('ldm-input-page').querySelector('.form-container');
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if(input.type !== 'date' && !input.readOnly) {
                input.value = '';
            }
        });
        // Manually reset read-only calculated fields
        document.getElementById('total-weight-ldm').value = '';
        document.getElementById('status-ldm').value = '';
        document.getElementById('ac-type-ldm').value = '';
        document.getElementById('route-ldm').value = '';
         document.getElementById('passengers-total-ldm').value = '';
        // Hide distribution containers
        document.getElementById('dist-boeing-container-ldm').style.display = 'none';
        document.getElementById('dist-airbus-container-ldm').style.display = 'none';
        document.getElementById('dist-atr-container-ldm').style.display = 'none';
    }

    // --- NAVIGATION ---
    enterBtn.addEventListener('click', () => {
        if (document.getElementById('user-name').value.trim() === '' || document.getElementById('usba-id').value.trim() === '') {
            alert('Please fill in both User Name and USBA ID to continue.');
        } else {
            showPage('selection-page');
        }
    });
    departureLdmBtn.addEventListener('click', () => showPage('selection-type-page'));
    onlyLdmBtn.addEventListener('click', () => showPage('ldm-input-page'));
    internationalBtn.addEventListener('click', () => showPage('data-input-page'));
    domesticBtn.addEventListener('click', () => showPage('data-input-page-dom'));

    selectionPreviousBtn.addEventListener('click', () => showPage('identification-page'));
    selectionTypePreviousBtn.addEventListener('click', () => showPage('selection-page'));
    dataPreviousBtnIntl.addEventListener('click', () => showPage('selection-type-page'));
    dataPreviousBtnDom.addEventListener('click', () => showPage('selection-type-page'));
    dataPreviousBtnLdm.addEventListener('click', () => showPage('selection-page'));
    reportBackBtn.addEventListener('click', () => showPage(lastDataPage));
    
    // ADDED EVENT LISTENER FOR NEW BUTTON
    newReportBtn.addEventListener('click', () => {
        resetLdmForm();
        showPage('ldm-input-page');
    });

    // --- UNIVERSAL HELPER FUNCTIONS ---
    const routeMap = {"DAC-CGP":[101,103,105,107,109,111,113,115,117,119],"DAC-CXB":[141,143,145,147,149,151,153,155,157,159],"DAC-CCU":[201,203],"DAC-SIN":[307,309],"DAC-ZYL":[531,533,535,537,539],"DAC-JSR":[121,123,125,127,129],"DAC-RJH":[161,163,165,167,169],"DAC-BZL":[171,173,175,177,179],"DAC-SPD":[181,183,185,187,189,191,193,195,197,199],"DAC-MAA":[205,207,209],"DAC-BKK":[217],"DAC-KUL":[315,317,319],"DAC-AUH":[349],"DAC-DOH":[333],"DAC-MCT":[321,323],"DAC-SHJ":[345,347],"DAC-CAN":[325,327],"DAC-DXB":[341,343],"DAC-JED":[361,363],"DAC-RUH":[381,383],"DAC-MLE":[337,339]};
    const acTypeMap = { atr: ['AKG','AKK','AKH','AKI','AKJ','AKL','AKM','AKO','AKP'], boeing: ['AJG','AJH','AJE','AJF'], airbus: ['ALA','ALB','ALD'] };
    const specialRegMap = {
        'PKBBG': { type: 'BOEING 737' }, 'BBG': { type: 'BOEING 737' },
        'PKBBH': { type: 'BOEING 737' }, 'BBH': { type: 'BOEING 737' },
        '9HSAU': { type: 'BOEING 737' }, 'SAU': { type: 'BOEING 737' }
    };

    function setupDataInputPage(type) {
        const pageId = type === 'dom' || type === 'intl' ? `data-input-page-${type}`.replace('-intl', '') : `${type}-input-page`;
        const page = document.getElementById(pageId);
        if (!page) return;

        document.getElementById(`date-${type}`).value = new Date().toISOString().split('T')[0];
        const flightNoSuffix = document.getElementById(`flight-no-suffix-${type}`);
        const routeField = document.getElementById(`route-${type}`);
        const acRegSuffix = document.getElementById(`ac-reg-suffix-${type}`);
        const acTypeField = document.getElementById(`ac-type-${type}`);
        const stdInput = document.getElementById(`std-${type}`);
        const chocksOffInput = document.getElementById(`chocks-off-${type}`);
        const departureStatusInput = document.getElementById(`departure-status-${type}`);
        
        if (type === 'intl' || type === 'dom' || type === 'ldm') {
            const maleInput = document.getElementById(`passengers-male-${type}`);
            const femaleInput = document.getElementById(`passengers-female-${type}`);
            const childInput = document.getElementById(`passengers-child-${type}`);
            const totalInput = document.getElementById(`passengers-total-${type}`);
            
            const updateTotal = () => {
                const male = parseInt(maleInput.value) || 0;
                const female = parseInt(femaleInput.value) || 0;
                const child = parseInt(childInput.value) || 0;
                totalInput.value = male + female + child;
            };
            
            [maleInput, femaleInput, childInput].forEach(el => el.addEventListener('input', updateTotal));
        }
        
        if (type === 'ldm') {
            const bagWeight = document.getElementById('baggage-weight-ldm');
            const cargoWeight = document.getElementById('cargo-weight-ldm');
            const totalWeight = document.getElementById('total-weight-ldm');
            const distBoeing = document.getElementById('dist-boeing-container-ldm');
            const distAirbus = document.getElementById('dist-airbus-container-ldm');
            const distAtr = document.getElementById('dist-atr-container-ldm');
            const status = document.getElementById('status-ldm');
            const distBoeingInputs = distBoeing.querySelectorAll('input');
            const distAirbusInputs = distAirbus.querySelectorAll('input');
            const distAtrInputs = distAtr.querySelectorAll('input');

            const updateDistributionStatus = () => {
                const totalW = parseFloat(totalWeight.value) || 0;
                let distSum = 0;
                
                if (distBoeing.style.display !== 'none') {
                    distBoeingInputs.forEach(input => distSum += parseFloat(input.value) || 0);
                } else if (distAirbus.style.display !== 'none') {
                    distAirbusInputs.forEach(input => distSum += parseFloat(input.value) || 0);
                } else if (distAtr.style.display !== 'none') {
                    distAtrInputs.forEach(input => distSum += parseFloat(input.value) || 0);
                }
                
                if (totalW === 0 && distSum === 0) {
                     status.value = '';
                     return;
                }

                const diff = distSum - totalW;
                if (diff === 0) status.value = 'EQUAL';
                else if (diff > 0) status.value = `+${diff}`;
                else status.value = `${diff}`;
            };

            const updateTotalWeight = () => {
                const bagW = parseFloat(bagWeight.value) || 0;
                const cargoW = parseFloat(cargoWeight.value) || 0;
                totalWeight.value = bagW + cargoW;
                updateDistributionStatus();
            };

            bagWeight.addEventListener('input', updateTotalWeight);
            cargoWeight.addEventListener('input', updateTotalWeight);
            distBoeingInputs.forEach(input => input.addEventListener('input', updateDistributionStatus));
            distAirbusInputs.forEach(input => input.addEventListener('input', updateDistributionStatus));
            distAtrInputs.forEach(input => input.addEventListener('input', updateDistributionStatus));
        }

        acRegSuffix.addEventListener('input', () => {
            const reg = acRegSuffix.value.toUpperCase();
            let currentAcType = '';
            
            if (specialRegMap[reg]) {
                currentAcType = specialRegMap[reg].type;
            } else if (acTypeMap.atr.includes(reg)) {
                currentAcType = "ATR-72-600";
            } else if (acTypeMap.boeing.includes(reg)) {
                currentAcType = "BOEING 737";
            } else if (acTypeMap.airbus.includes(reg)) {
                currentAcType = "AIRBUS 330";
            }
            acTypeField.value = currentAcType;

            if (type === 'ldm') {
                const prefixSpan = document.getElementById('ac-reg-prefix-ldm');
                 if (specialRegMap[reg]) {
                    prefixSpan.textContent = '';
                } else {
                    prefixSpan.textContent = 'S2-';
                }

                const distBoeing = document.getElementById('dist-boeing-container-ldm');
                const distAirbus = document.getElementById('dist-airbus-container-ldm');
                const distAtr = document.getElementById('dist-atr-container-ldm');

                if (currentAcType.includes("BOEING")) {
                    distBoeing.style.display = 'flex';
                    distAirbus.style.display = 'none';
                    distAtr.style.display = 'none';
                } else if (currentAcType.includes("AIRBUS")) {
                    distBoeing.style.display = 'none';
                    distAirbus.style.display = 'flex';
                    distAtr.style.display = 'none';
                } else if (currentAcType.includes("ATR")) {
                    distBoeing.style.display = 'none';
                    distAirbus.style.display = 'none';
                    distAtr.style.display = 'flex';
                } else {
                    distBoeing.style.display = 'none';
                    distAirbus.style.display = 'none';
                    distAtr.style.display = 'none';
                }
            }
        });

        flightNoSuffix.addEventListener('input', () => {
            const flightNum = parseInt(flightNoSuffix.value, 10);
            let route = '';
            for (const [routeValue, numbers] of Object.entries(routeMap)) {
                if (numbers.includes(flightNum)) { route = routeValue; break; }
            }
            routeField.value = route;
        });

        function updateDepartureStatus() {
            if (stdInput.value && chocksOffInput.value) {
                const stdDate = new Date(`1970-01-01T${stdInput.value}:00`);
                const chocksOffDate = new Date(`1970-01-01T${chocksOffInput.value}:00`);
                const diffMinutes = (chocksOffDate - stdDate) / 60000;
                if (diffMinutes > 0) departureStatusInput.value = `FLIGHT ${diffMinutes} MINS LATE`;
                else if (diffMinutes < 0) departureStatusInput.value = `FLIGHT ${Math.abs(diffMinutes)} MINS EARLY`;
                else departureStatusInput.value = 'ON TIME';
            } else {
                 departureStatusInput.value = 'ON TIME';
            }
        }
        stdInput.addEventListener('change', updateDepartureStatus);
        chocksOffInput.addEventListener('change', updateDepartureStatus);
    }

    function formatTimeInput(e) {
        const input = e.target;
        let value = input.value.replace(/\D/g, ''); 
        if (value.length > 2) input.value = value.slice(0, 2) + ':' + value.slice(2, 4);
        else input.value = value;
    }
    document.querySelectorAll('.time-input').forEach(input => input.addEventListener('input', formatTimeInput));
    document.querySelectorAll('input[type="text"], textarea').forEach(el => {
        if (!el.classList.contains('time-input')) {
            el.addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase() });
        }
    });

    // --- REPORT GENERATION ---
    function generateInternationalReport() {
        const getVal = (id, defaultVal = 'N/A') => (document.getElementById(id + '-intl').value || defaultVal).toUpperCase();
        const getNumVal = (id, defaultVal = '0') => (document.getElementById(id + '-intl').value || defaultVal);
        const getPaxVal = (id, defaultVal = '00') => (document.getElementById(`passengers-${id}-intl`).value || defaultVal);
        const reportData = {
            userName: (document.getElementById('user-name').value || 'N/A').toUpperCase(),
            usbaId: (document.getElementById('usba-id').value || 'N/A').toUpperCase(),
            stationName: (document.getElementById('station-name').value || 'N/A').toUpperCase(),
            date: getVal('date', ''), flightNo: `BS-${getVal('flight-no-suffix', '(N/A)')}`, route: getVal('route'),
            acReg: `S2-${getVal('ac-reg-suffix', '')}`, acType: getVal('ac-type'), captain: getVal('captain'), configure: getVal('configure'),
            std: getVal('std'), doorClosed: getVal('door-closed'), chocksOff: getVal('chocks-off'), airborne: getVal('airborne'),
            departureStatus: getVal('departure-status'), 
            flightLoad: getNumVal('flight-load'),
            fuelUplift: getNumVal('fuel-uplift'), 
            paxMale: getPaxVal('male'), paxFemale: getPaxVal('female'), paxChild: getPaxVal('child'), paxInfant: getPaxVal('infant'), paxTotal: getPaxVal('total', '000'),
            baggageWeight: getNumVal('baggage-weight'), baggagePcs: getNumVal('baggage-pcs'),
            cargoWeight: getNumVal('cargo-weight'), cargoPcs: getNumVal('cargo-pcs'),
            crewBagWeight: getNumVal('crew-bag-weight'), crewBagPcs: getNumVal('crew-bag-pcs'), crewBagComNo: getVal('crew-bag-com-no'),
            mail: getVal('mail', '0'), counterNoshow: getNumVal('counter-noshow'), gateNoShow: getNumVal('gate-no-show'),
            selfOffload: getNumVal('self-offload'), refused: getNumVal('refused'), immigrationOff: getNumVal('immigration-off'),
            immigrationNotFace: getNumVal('immigration-not-face'), customOff: getNumVal('custom-off'), vip: getNumVal('vip'),
            cip: getNumVal('cip'), maas: getNumVal('maas'), umPax: getNumVal('um-pax'),
            wchrFig: getNumVal('wchr-fig'), wchrSeat: getVal('wchr-seat'), wchcFig: getNumVal('wchc-fig'), wchcSeat: getVal('wchc-seat'),
            checkInStuff: getVal('check-in-stuff'), loadingStuff: getVal('loading-stuff'), loadController: getVal('load-controller'),
            paxHandling: getVal('pax-handling'), remarks: getVal('remarks', 'NIL')
        };
        const messageContent = `<b>FLIGHT DEPARTURE MESSAGE</b>\n--------------------------------------\nDATE: ${reportData.date}\n<b>FLIGHT NO: ${reportData.flightNo} (${reportData.route})</b>\nA/C REG: ${reportData.acReg}\nA/C TYPE: ${reportData.acType}\nCAPTAIN: ${reportData.captain}\nCONFIGURE: ${reportData.configure}\n\n<b>FLIGHT OPERATIONS SUMMARY</b>\n--------------------------------------\nSTD: ${reportData.std !== 'N/A' ? reportData.std + ' LT' : 'N/A'}\nDOOR CLOSED: ${reportData.doorClosed !== 'N/A' ? reportData.doorClosed + ' LT' : 'N/A'}\nCHOCKS OFF: ${reportData.chocksOff !== 'N/A' ? reportData.chocksOff + ' LT' : 'N/A'}\nAIRBORNE: ${reportData.airborne !== 'N/A' ? reportData.airborne + ' LT' : 'N/A'}\nDEPARTURE STATUS: ${reportData.departureStatus}\nFUEL UPLIFT: ${reportData.fuelUplift} KG\n\n<b>LOAD SUMMARY</b>\n--------------------------------------\nPASSENGERS: AS PER SYSTEM\nBAGGAGE: ${reportData.baggageWeight} KG / ${reportData.baggagePcs} PCS\nCARGO: ${reportData.cargoWeight} KG / ${reportData.cargoPcs} PCS\nMAIL: ${reportData.mail}\n\n<b>PASSENGER HANDLING DETAILS</b>\n--------------------------------------\nCOUNTER NOSHOW: ${reportData.counterNoshow}\nGATE NO SHOW: ${reportData.gateNoShow}\nSELF OFFLOAD: ${reportData.selfOffload}\nREFUSED: ${reportData.refused}\nIMMIGRATION OFF: ${reportData.immigrationOff}\nIMMIGRATION NOT FACE: ${reportData.immigrationNotFace}\nCUSTOM OFF: ${reportData.customOff}\n\n<b>SPECIAL HANDLING</b>\n--------------------------------------\nVIP: ${reportData.vip}\nCIP: ${reportData.cip}\nMAAS: ${reportData.maas}\nUM PAX: ${reportData.umPax}\nWCHR: ${reportData.wchrFig} (${reportData.wchrSeat})\nWCHC: ${reportData.wchcFig} (${reportData.wchcSeat})\n\n<b>DUTY PERSONNEL:</b>\n--------------------------------------\nLOADING STUFF / G7: ${reportData.loadingStuff}\nLOAD CONTROLLER: ${reportData.loadController}\n\n<b>REMARKS:</b>\n--------------------------------------\n${reportData.remarks}\n\n--------------------------------------\n<b>PREPARED BY:\nNAME: ${reportData.userName}\nID: ${reportData.usbaId}\nSTATION: ${reportData.stationName}</b>`;
        generateFinalReport(reportData, messageContent, 'intl');
    }
    
    function generateLdmReport() {
        const getVal = (id, defaultVal = 'N/A') => (document.getElementById(id + '-ldm').value || defaultVal).toUpperCase();
        const getNumVal = (id, defaultVal = '0') => (document.getElementById(id + '-ldm').value || defaultVal);
        const getPaxVal = (id, defaultVal = '00') => (document.getElementById(`passengers-${id}-ldm`).value || defaultVal);

        const rawReg = getVal('ac-reg-suffix');
        let finalAcRegDisplay, finalAcRegLdm;

        if (['PKBBG', 'BBG'].includes(rawReg)) {
            finalAcRegDisplay = 'PK-BBG';
            finalAcRegLdm = 'PKBBG';
        } else if (['PKBBH', 'BBH'].includes(rawReg)) {
            finalAcRegDisplay = 'PK-BBH';
            finalAcRegLdm = 'PKBBH';
        } else if (['9HSAU', 'SAU'].includes(rawReg)) {
            finalAcRegDisplay = '9H-SAU';
            finalAcRegLdm = '9HSAU';
        } else {
            finalAcRegDisplay = `S2-${rawReg}`;
            finalAcRegLdm = `S2${rawReg}`;
        }

        const reportData = {
            userName: (document.getElementById('user-name').value || 'N/A').toUpperCase(),
            usbaId: (document.getElementById('usba-id').value || 'N/A').toUpperCase(),
            stationName: (document.getElementById('station-name').value || 'N/A').toUpperCase(),
            date: getVal('date', ''), 
            flightNo: `BS-${getVal('flight-no-suffix', '(N/A)')}`, 
            flightNoSuffix: getVal('flight-no-suffix'),
            route: getVal('route'),
            acReg: finalAcRegDisplay, 
            acRegLdm: finalAcRegLdm,
            acType: getVal('ac-type'), 
            captain: getVal('captain'), 
            configure: getVal('configure'),
            std: getVal('std'), doorClosed: getVal('door-closed'), chocksOff: getVal('chocks-off'), airborne: getVal('airborne'),
            departureStatus: getVal('departure-status'), fuelUplift: getNumVal('fuel-uplift'),
            paxMale: getPaxVal('male'), paxFemale: getPaxVal('female'), paxChild: getPaxVal('child'), paxInfant: getPaxVal('infant'), paxTotal: getPaxVal('total', '000'),
            baggageWeight: getNumVal('baggage-weight'), baggagePcs: getNumVal('baggage-pcs'), baggageComNo: getVal('baggage-com-no'),
            cargoWeight: getNumVal('cargo-weight'), cargoPcs: getNumVal('cargo-pcs'), cargoComNo: getVal('cargo-com-no'),
            crewBagPcs: getNumVal('crew-bag-pcs'), crewBagComNo: getVal('crew-bag-com-no'),
            mail: getVal('mail', '0'), counterNoshow: getNumVal('counter-noshow'), gateNoShow: getNumVal('gate-no-show'),
            selfOffload: getNumVal('self-offload'), refused: getNumVal('refused'), immigrationOff: getNumVal('immigration-off'),
            immigrationNotFace: getNumVal('immigration-not-face'), customOff: getNumVal('custom-off'),
            maas: getNumVal('maas'), umPax: getNumVal('um-pax'),
            wchrFig: getNumVal('wchr-fig'), wchrSeat: getVal('wchr-seat'), wchcFig: getNumVal('wchc-fig'), wchcSeat: getVal('wchc-seat'),
            loadingStuff: getVal('loading-stuff'), loadController: getVal('load-controller'),
            paxHandling: getVal('pax-handling'), remarks: getVal('remarks', 'NIL'),
            dist: {
                b1: getNumVal('dist-b1'), b2: getNumVal('dist-b2'), b3: getNumVal('dist-b3'), b4: getNumVal('dist-b4'),
                a1: getNumVal('dist-a1'), a2: getNumVal('dist-a2'), a3: getNumVal('dist-a3'), a4: getNumVal('dist-a4'), a5: getNumVal('dist-a5'),
                atrFwr: getNumVal('dist-atr-fwr'), atrFwl: getNumVal('dist-atr-fwl'), atrAft: getNumVal('dist-atr-aft')
            }
        };

        const messageContent = `<b>FLIGHT DEPARTURE MESSAGE</b>\n--------------------------------------\nDATE: ${reportData.date}\n<b>FLIGHT NO: ${reportData.flightNo} (${reportData.route})</b>\nA/C REG: ${reportData.acReg}\nA/C TYPE: ${reportData.acType}\nCAPTAIN: ${reportData.captain}\nCONFIGURE: ${reportData.configure}\n\n<b>FLIGHT OPERATIONS SUMMARY</b>\n--------------------------------------\nSTD: ${reportData.std !== 'N/A' ? reportData.std + ' UTC' : 'N/A'}\nDOOR CLOSED: ${reportData.doorClosed !== 'N/A' ? reportData.doorClosed + ' UTC' : 'N/A'}\nCHOCKS OFF: ${reportData.chocksOff !== 'N/A' ? reportData.chocksOff + ' UTC' : 'N/A'}\nAIRBORNE: ${reportData.airborne !== 'N/A' ? reportData.airborne + ' UTC' : 'N/A'}\nDEPARTURE STATUS: ${reportData.departureStatus}\nFUEL UPLIFT: ${reportData.fuelUplift} KG\n\n<b>LOAD SUMMARY</b>\n--------------------------------------\nPASSENGERS: AS PER SYSTEM\nBAGGAGE: ${reportData.baggageWeight} KG / ${reportData.baggagePcs} PCS / COM NO ${reportData.baggageComNo}\nCREW BAG: ${reportData.crewBagPcs} PCS / COM NO ${reportData.crewBagComNo}\nCARGO: ${reportData.cargoWeight} KG / ${reportData.cargoPcs} PCS / COM NO ${reportData.cargoComNo}\nMAIL: ${reportData.mail}\nUNDER LOAD: ${reportData.paxHandling}\n\n<b>PASSENGER HANDLING DETAILS</b>\n--------------------------------------\nCOUNTER NOSHOW: ${reportData.counterNoshow}\nGATE NO SHOW: ${reportData.gateNoShow}\nSELF OFFLOAD: ${reportData.selfOffload}\nREFUSED: ${reportData.refused}\nIMMIGRATION OFF: ${reportData.immigrationOff}\nIMMIGRATION NOT FACE: ${reportData.immigrationNotFace}\nCUSTOM OFF: ${reportData.customOff}\n\n<b>SPECIAL HANDLING</b>\n--------------------------------------\nMAAS: ${reportData.maas}\nUM PAX: ${reportData.umPax}\nWCHR: ${reportData.wchrFig} (${reportData.wchrSeat})\nWCHC: ${reportData.wchcFig} (${reportData.wchcSeat})\n\n<b>DUTY PERSONNEL:</b>\n--------------------------------------\nLOADING STUFF / G7: ${reportData.loadingStuff}\nLOAD CONTROLLER: ${reportData.loadController}\n\n<b>REMARKS:</b>\n--------------------------------------\n${reportData.remarks}\n\n--------------------------------------\n<b>PREPARED BY:\nNAME: ${reportData.userName}\nID: ${reportData.usbaId}\nSTATION: ${reportData.stationName}</b>`;
        generateFinalReport(reportData, messageContent, 'ldm', true);
    }

    function generateDomesticReport() {
        const getVal = (id, defaultVal = 'N/A') => (document.getElementById(id + '-dom').value || defaultVal).toUpperCase();
        const getNumVal = (id, defaultVal = '0') => (document.getElementById(id + '-dom').value || defaultVal);
        const getPaxVal = (id, defaultVal = '00') => (document.getElementById(`passengers-${id}-dom`).value || defaultVal);
        const reportData = {
            userName: (document.getElementById('user-name').value || 'N/A').toUpperCase(),
            usbaId: (document.getElementById('usba-id').value || 'N/A').toUpperCase(),
            stationName: (document.getElementById('station-name').value || 'N/A').toUpperCase(),
            date: getVal('date', ''), flightNo: `BS-${getVal('flight-no-suffix', '(N/A)')}`, route: getVal('route'),
            acReg: `S2-${getVal('ac-reg-suffix', '')}`, acType: getVal('ac-type'), captain: getVal('captain'), configure: getVal('configure'),
            std: getVal('std'), doorClosed: getVal('door-closed'), chocksOff: getVal('chocks-off'), airborne: getVal('airborne'),
            departureStatus: getVal('departure-status'),
            flightLoad: getNumVal('flight-load'),
            fuelUplift: getNumVal('fuel-uplift'), 
            paxMale: getPaxVal('male'), paxFemale: getPaxVal('female'), paxChild: getPaxVal('child'), paxInfant: getPaxVal('infant'), paxTotal: getPaxVal('total', '000'),
            baggageWeight: getNumVal('baggage-weight'), baggagePcs: getNumVal('baggage-pcs'),
            cargoWeight: getNumVal('cargo-weight'), cargoPcs: getNumVal('cargo-pcs'),
            mail: getVal('mail', '0'), counterNoshow: getNumVal('counter-noshow'), gateNoShow: getNumVal('gate-no-show'),
            selfOffload: getNumVal('self-offload'), vip: getNumVal('vip'),
            cip: getNumVal('cip'), maas: getNumVal('maas'), umPax: getNumVal('um-pax'),
            wchrFig: getNumVal('wchr-fig'), wchrSeat: getVal('wchr-seat'), wchcFig: getNumVal('wchc-fig'), wchcSeat: getVal('wchc-seat'),
            checkInStuff: getVal('check-in-stuff'), loadingStuff: getVal('loading-stuff'), loadController: getVal('load-controller'),
            paxHandling: getVal('pax-handling'), remarks: getVal('remarks', 'NIL')
        };
        const messageContent = `<b>FLIGHT DEPARTURE MESSAGE</b>\n--------------------------------------\nDATE: ${reportData.date}\n<b>FLIGHT NO: ${reportData.flightNo} (${reportData.route})</b>\nA/C REG: ${reportData.acReg}\nA/C TYPE: ${reportData.acType}\nCAPTAIN: ${reportData.captain}\nCONFIGURE: ${reportData.configure}\n\n<b>FLIGHT OPERATIONS SUMMARY</b>\n--------------------------------------\nSTD: ${reportData.std !== 'N/A' ? reportData.std + ' LT' : 'N/A'}\nDOOR CLOSED: ${reportData.doorClosed !== 'N/A' ? reportData.doorClosed + ' LT' : 'N/A'}\nCHOCKS OFF: ${reportData.chocksOff !== 'N/A' ? reportData.chocksOff + ' LT' : 'N/A'}\nAIRBORNE: ${reportData.airborne !== 'N/A' ? reportData.airborne + ' LT' : 'N/A'}\nDEPARTURE STATUS: ${reportData.departureStatus}\nFUEL UPLIFT: ${reportData.fuelUplift} KG\n\n<b>LOAD SUMMARY</b>\n--------------------------------------\nPASSENGERS: AS PER SYSTEM\nBAGGAGE: ${reportData.baggageWeight} KG / ${reportData.baggagePcs} PCS\nCARGO: ${reportData.cargoWeight} KG / ${reportData.cargoPcs} PCS\nMAIL: ${reportData.mail}\n\n<b>PASSENGER HANDLING DETAILS</b>\n--------------------------------------\nCOUNTER NOSHOW: ${reportData.counterNoshow}\nGATE NO SHOW: ${reportData.gateNoShow}\nSELF OFFLOAD: ${reportData.selfOffload}\n\n<b>SPECIAL HANDLING</b>\n--------------------------------------\nVIP: ${reportData.vip}\nCIP: ${reportData.cip}\nMAAS: ${reportData.maas}\nUM PAX: ${reportData.umPax}\nWCHR: ${reportData.wchrFig} (${reportData.wchrSeat})\nWCHC: ${reportData.wchcFig} (${reportData.wchcSeat})\n\n<b>DUTY PERSONNEL:</b>\n--------------------------------------\nLOADING STUFF / G7: ${reportData.loadingStuff}\nLOAD CONTROLLER: ${reportData.loadController}\n\n<b>REMARKS:</b>\n--------------------------------------\n${reportData.remarks}\n\n--------------------------------------\n<b>PREPARED BY:\nNAME: ${reportData.userName}\nID: ${reportData.usbaId}\nSTATION: ${reportData.stationName}</b>`;
        generateFinalReport(reportData, messageContent, 'dom');
    }
    
    function formatDate(dateString, format = 'DDMONYY') {
        if (!dateString) return 'N/A';
        const date = new Date(dateString + 'T00:00:00Z');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = date.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }).toUpperCase();
        const year = date.getUTCFullYear().toString().slice(-2);
        if (format === 'DDMON') return `${day}${month}`;
        if (format === 'DD') return day;
        return `${day}${month}${year}`;
    }

    // NEW FUNCTION: Determine Seat Configuration String
    function getSeatConfig(regInput) {
        const reg = regInput.toUpperCase();
        
        // Airbus 436
        if (['ALA', 'ALB', 'ALD'].includes(reg)) return 'C0Y436';
        
        // Boeing 189
        if (['AJG', 'AJH', 'AJE', 'AJF', 'SAU', '9HSAU', 'BBH', 'PKBBH'].includes(reg)) return 'C0Y189';
        
        // Boeing 186
        if (['BBG', 'PKBBG'].includes(reg)) return 'C0Y186';
        
        // ATR 78
        if (reg === 'AKO') return 'C0Y78';
        
        // Rest ATR 72
        if (['AKG', 'AKK', 'AKH', 'AKI', 'AKJ', 'AKL', 'AKM', 'AKP'].includes(reg)) return 'C0Y72';
        
        // Default Fallback
        return 'C0Y189';
    }

    function generateLdmForDestination(d) {
        const destination = (d.route.split('-')[1] || '').toUpperCase();
        let ldm = '';
        const dynamicRegards = `REGARDS,\n______________________________\n${d.userName.toUpperCase()}\nLOAD CONTROL OFFICER II\nUSBA-${d.usbaId.toUpperCase()} II DAC APT II`;

        // Common data points
        const totalLoad = (parseInt(d.baggageWeight) || 0) + (parseInt(d.cargoWeight) || 0);
        const isAirbus = d.acType.includes("AIRBUS");
        const isAtr = d.acType.includes("ATR");
        
        const dist1 = isAirbus ? d.dist.a1 : d.dist.b1;
        const dist2 = isAirbus ? d.dist.a2 : d.dist.b2;
        const dist3 = isAirbus ? d.dist.a3 : d.dist.b3;
        const dist4 = isAirbus ? d.dist.a4 : d.dist.b4;
        const dist5 = isAirbus ? d.dist.a5 : '0';
        
        // Calculate Seat Config based on reg input (suffix or full)
        const seatConfig = getSeatConfig(d.acRegLdm.replace('S2', '').replace('PK', '').replace('9H', ''));

        let siLines = [];

        let crewBagSiLine = '';
        if (parseInt(d.crewBagPcs, 10) > 0 && d.crewBagComNo && d.crewBagComNo !== 'N/A') {
            crewBagSiLine = `SI CREWBAG :${String(d.crewBagPcs).padStart(2, '0')}/C${d.crewBagComNo}`;
        }

        // ADDED MAIL LOGIC
        let comailSiLine = '';
        const mailPcs = parseInt(d.mail.replace(/\D/g, ''), 10);
        if (!isNaN(mailPcs) && mailPcs > 0) {
            if (mailPcs === 1) {
                comailSiLine = `SI COMAIL: ${String(mailPcs).padStart(2, '0')} PC`;
            } else {
                comailSiLine = `SI COMAIL: ${String(mailPcs).padStart(2, '0')} PCS`;
            }
        }

        // Generate WCHR/WCHC lines in the new format for all except JED/RUH
        let siWcLines = [];
        if (parseInt(d.wchrFig) > 0 && d.wchrSeat && d.wchrSeat !== 'N/A') {
            siWcLines.push(`SI WCHR: ${String(d.wchrFig).padStart(2, '0')} (${d.wchrSeat})`);
        }
        if (parseInt(d.wchcFig) > 0 && d.wchcSeat && d.wchcSeat !== 'N/A') {
            siWcLines.push(`SI WCHC: ${String(d.wchcFig).padStart(2, '0')} (${d.wchcSeat})`);
        }
        const wcSiString = siWcLines.join('\n');


        switch(destination) {
            case 'DOH':
            // AIRBUS (AL Series) এর জন্য লজিক - AL দিয়ে রেজিস্ট্রেশন শুরু হলে (যেমন S2ALA)
            if (d.acRegLdm.includes('AL')) {
                // ইনপুট থেকে COM NO গুলোকে আলাদা করা হচ্ছে
                const bagComsDoh = d.baggageComNo ? d.baggageComNo.split(',').map(s => s.trim()) : [];
                const cgoComsDoh = d.cargoComNo ? d.cargoComNo.split(',').map(s => s.trim()) : [];

                // CPT স্ট্যাটাস বের করার ফাংশন
                const getCptLineDoh = (cptNum) => {
                    const sNum = String(cptNum);
                    const hasBag = bagComsDoh.includes(sNum);
                    const hasCgo = cgoComsDoh.includes(sNum);
                    
                    if (hasBag && hasCgo) return "BAG/CGO BY";
                    if (hasBag) return "BAG BY";
                    if (hasCgo) return "CGO BY";
                    return "NIL";
                };

                // ৫টি কম্পার্টমেন্ট সহ LDM লাইন (Airbus এর জন্য)
                ldm = `LDM\nBS${d.flightNoSuffix}/${formatDate(d.date, 'DDMONYY')}.${d.acRegLdm}.${seatConfig}.${d.configure}\n` +
                      `-${destination}.${d.paxMale}/${d.paxFemale}/${d.paxChild}/${d.paxInfant}.T.${totalLoad}.1/${dist1}.2/${dist2}.3/${dist3}.4/${dist4}.5/${dist5}.PAX.00/${d.paxTotal}.PAD/0/0\n`+
                      `CPT1- ${getCptLineDoh(1)}\n`+
                      `CPT2- ${getCptLineDoh(2)}\n`+
                      `CPT3- ${getCptLineDoh(3)}\n`+
                      `CPT4- ${getCptLineDoh(4)}\n`+
                      `CPT5- ${getCptLineDoh(5)}\n\n`+
                      `${destination} FRE 0 POS 0 BAG ${d.baggagePcs} PCS /${d.baggageWeight} KGS EQP 0 TRA 0\n`+
                      `${destination} FRE 0 POS 0 CGO ${d.cargoPcs} PCS/ ${d.cargoWeight} KGS EQP 0 TRA 0\n`;

            } else {
                // BOEING বা অন্য এয়ারক্রাফটের জন্য আগের লজিক (অপরিবর্তিত)
                ldm = `LDM\nBS${d.flightNoSuffix}/${formatDate(d.date, 'DDMONYY')}.${d.acRegLdm}.${seatConfig}.${d.configure}\n` +
                      `-${destination}.${d.paxMale}/${d.paxFemale}/${d.paxChild}/${d.paxInfant}.T.${totalLoad}.1/${dist1}.2/${dist2}.3/${dist3}.4/${dist4}.PAX.00/${d.paxTotal}.PAD/0/0\n`+
                      `CPT1- ${parseInt(dist1) > 0 ? 'BAG/CGO BY' : 'NIL'}\n`+
                      `CPT2- BAG BY\n`+
                      `CPT3- BAG BY\n`+
                      `CPT4- ${parseInt(dist4) > 0 ? 'BAG/CGO BY' : 'NIL'}\n\n`+
                      `${destination} FRE 0 POS 0 BAG ${d.baggagePcs} PCS /${d.baggageWeight} KGS EQP 0 TRA 0\n`+
                      `${destination} FRE 0 POS 0 CGO ${d.cargoPcs} PCS/ ${d.cargoWeight} KGS EQP 0 TRA 0\n`;
            }

            // সাধারণ SI লাইনগুলো যোগ করা (সব এয়ারক্রাফটের জন্য)
            if (crewBagSiLine) siLines.push(crewBagSiLine);
            if (wcSiString) siLines.push(wcSiString);
            if (comailSiLine) siLines.push(comailSiLine);
            if (siLines.length > 0) ldm += `\n${siLines.join('\n')}`;
            ldm += `\n\n\nEND\n\n\n${dynamicRegards}`;
            break;

            case 'SHJ':
            case 'DXB':
            case 'AUH':
                // Helper function to generate dynamic CPT lines
                const getCptLine = (cptNum, bagComs, cgoComs) => {
                    const hasBag = bagComs.includes(String(cptNum));
                    const hasCgo = cgoComs.includes(String(cptNum));
                    let content = 'NIL';
                    if (hasBag && hasCgo) content = 'BAG+CGO BY';
                    else if (hasBag) content = 'BAG BY';
                    else if (hasCgo) content = 'CGO BY';
                    return `CPT${cptNum}- ${content}`;
                };

                const bagComs = d.baggageComNo.split(',').map(s => s.trim());
                const cgoComs = d.cargoComNo.split(',').map(s => s.trim());

                // Format: BSxxx/DDMON.REG.SEAT.CREW
                ldm = `LDM\nBS${d.flightNoSuffix}/${formatDate(d.date, 'DDMON')}.${d.acRegLdm}.${seatConfig}.${d.configure}\n` +
                      `-${destination}.${d.paxMale}/${d.paxFemale}/${d.paxChild}/${d.paxInfant}.T.${totalLoad}.1/${dist1}.2/${dist2}.3/${dist3}.4/${dist4}.PAX/0/${d.paxTotal}.PAD/0/0\n\n` +
                      `${getCptLine(1, bagComs, cgoComs)}\n` +
                      `${getCptLine(2, bagComs, cgoComs)}\n` +
                      `${getCptLine(3, bagComs, cgoComs)}\n` +
                      `${getCptLine(4, bagComs, cgoComs)}\n\n` +
                      `${destination} C     ${d.cargoPcs}/     ${d.cargoWeight} M     0 B     ${d.baggagePcs}/     ${d.baggageWeight} O     0 T       0\n`;
                if (wcSiString) siLines.push(wcSiString);
                if (crewBagSiLine) siLines.push(crewBagSiLine);
                if (comailSiLine) siLines.push(comailSiLine);
                if (siLines.length > 0) ldm += `${siLines.join('\n')}\n`;
                ldm += `\n\n\nEND\n\n\n${dynamicRegards}`;
                break;
            
            case 'MCT':
                 // Format: BSxxx/DDMON.REG.SEAT.CREW
                 ldm = `LDM\nBS${d.flightNoSuffix}/${formatDate(d.date, 'DDMON')}.${d.acRegLdm}.${seatConfig}.${d.configure}\n` +
                      `-${destination}.${d.paxMale}/${d.paxFemale}/${d.paxChild}/${d.paxInfant}.T.${totalLoad}.1/${dist1}.2/${dist2}.3/${dist3}.4/${dist4}.PAX.00/${d.paxTotal}.PAD/0/0\n\n` +
                      `${destination} FRE 0 POS 0 BAG ${d.baggagePcs} PCS/${d.baggageWeight} KGS EQP 0 TRA 0\n` +
                      `${destination} FRE 0 POS 0 CGO ${d.cargoPcs} PCS/${d.cargoWeight} KGS  EQP 0 TRA 0\n\n`;
                siLines.push(`SI: MAAS ${String(d.maas).padStart(2,'0')}`);
                if (wcSiString) siLines.push(wcSiString);
                if (crewBagSiLine) siLines.push(crewBagSiLine);
                if (comailSiLine) siLines.push(comailSiLine);
                ldm += `${siLines.join('\n')}\n`;
                ldm += `\n\n\nEND\n\n\n${dynamicRegards}`;
                break;

            case 'RUH':
            case 'JED':
                let wcLinesRuh = [];
                if (parseInt(d.wchrFig) > 0 && d.wchrSeat && d.wchrSeat !== 'N/A') {
                    const formattedWchrSeat = d.wchrSeat.replace(/,\s*/g, '/');
                    wcLinesRuh.push(`SI O/B 0 WCHR: ${String(d.wchrFig).padStart(2, '0')} SN ${formattedWchrSeat}`);
                }
                if (parseInt(d.wchcFig) > 0 && d.wchcSeat && d.wchcSeat !== 'N/A') {
                    const formattedWchcSeat = d.wchcSeat.replace(/,\s*/g, '/');
                    wcLinesRuh.push(`SI O/B 0 WCHC: ${String(d.wchcFig).padStart(2, '0')} SN ${formattedWchcSeat}`);
                }
                const wcStringRuh = wcLinesRuh.join('\n');

                const dists = isAirbus ? `.1/${dist1}.2/${dist2}.3/${dist3}.4/${dist4}.5/${dist5}` : `.1/${dist1}.2/${dist2}.3/${dist3}.4/${dist4}`;
                // Format: BSxxx/DD.REG.SEAT.CREW (Specific requirement for JED/RUH)
                ldm = `LDM\nBS${d.flightNoSuffix}/${formatDate(d.date, 'DD')}.${d.acRegLdm}.${seatConfig}.${d.configure}\n` +
                      `-${destination}.${d.paxMale}/${d.paxFemale}/${d.paxChild}/${d.paxInfant}.T${totalLoad}${dists}.PAX/0/${d.paxTotal}.PAD/0/0\n`;
                if (wcStringRuh) {
                    ldm += `${wcStringRuh}\n`;
                }
                ldm += `SI ${destination} C     ${d.cargoPcs}/     ${d.cargoWeight} M     0    B     ${d.baggagePcs}/     ${d.baggageWeight} O     0 T     0\n`;
                if (crewBagSiLine) ldm += `${crewBagSiLine}\n`;
                if (comailSiLine) ldm += `${comailSiLine}\n`;
                ldm += `\nEND\n\n\n${dynamicRegards}`;
                break;

            case 'CCU':
                if (d.baggageComNo && d.baggageComNo !== 'N/A' && parseInt(d.baggagePcs) > 0) {
                    siLines.push(`SI: ALL BAG LDD IN C: ${d.baggageComNo} - ${d.baggagePcs} PCS/ ${d.baggageWeight} KGS.`);
                }
                if (d.cargoComNo && d.cargoComNo !== 'N/A' && parseInt(d.cargoPcs) > 0) {
                    siLines.push(`SI: ALL CGO LDD IN C: ${d.cargoComNo} - ${d.cargoPcs} PCS/ ${d.cargoWeight} KGS`);
                }
                if(parseInt(d.maas) > 0) siLines.push(`SI MAAS - ${String(d.maas).padStart(2, '0')}`);
                if (wcSiString) siLines.push(wcSiString);
                if (crewBagSiLine) siLines.push(crewBagSiLine);
                if (comailSiLine) siLines.push(comailSiLine);

                const distsCCU = isAirbus ? `.1/${dist1}.2/${dist2}.3/${dist3}.4/${dist4}.5/${dist5}` : `.1/${dist1}.2/${dist2}.3/${dist3}.4/${dist4}`;
                
                let loadLineCCU = '';
                if (isAtr) {
                    // ATR Format for all stations (including CCU)
                    loadLineCCU = `-${destination}.${d.paxMale}/${d.paxFemale}/${d.paxChild}/${d.paxInfant}.T.${totalLoad}.H- FWD&AFT.\nPAX.00/${d.paxTotal}.PAD.00/00`;
                } else {
                    // Boeing Format for CCU (with newline before PAX)
                    loadLineCCU = `-${destination}.${d.paxMale}/${d.paxFemale}/${d.paxChild}/${d.paxInfant}.T.${totalLoad}${distsCCU}.\nPAX.00/${d.paxTotal}.PAD.00/00`;
                }

                ldm = `LDM\n\nBS${d.flightNoSuffix}/${formatDate(d.date, 'DDMONYY')}.${d.acRegLdm}.${seatConfig}.${d.configure}\n`+
                      `${loadLineCCU}\n\n` +
                      (siLines.length > 0 ? siLines.join('\n') : '') + `\n\nEND\n\n\n${dynamicRegards}`;
                break;
            
            default: // Rest of international & Domestic
                if (d.baggageComNo && d.baggageComNo !== 'N/A' && parseInt(d.baggagePcs) > 0) {
                    siLines.push(`SI: ALL BAG LDD IN C: ${d.baggageComNo} - ${d.baggagePcs} PCS/ ${d.baggageWeight} KGS.`);
                }
                if (d.cargoComNo && d.cargoComNo !== 'N/A' && parseInt(d.cargoPcs) > 0) {
                    siLines.push(`SI: ALL CGO LDD IN C: ${d.cargoComNo} - ${d.cargoPcs} PCS/ ${d.cargoWeight} KGS`);
                }
                if(parseInt(d.maas) > 0) siLines.push(`SI MAAS - ${String(d.maas).padStart(2, '0')}`);
                if (wcSiString) siLines.push(wcSiString);
                if (crewBagSiLine) siLines.push(crewBagSiLine);
                if (comailSiLine) siLines.push(comailSiLine);
                
                const distsDefault = isAirbus ? `.1/${dist1}.2/${dist2}.3/${dist3}.4/${dist4}.5/${dist5}` : `.1/${dist1}.2/${dist2}.3/${dist3}.4/${dist4}`;
                
                let loadLineDefault = '';
                if (isAtr) {
                    // ATR Format for all stations
                    loadLineDefault = `-${destination}.${d.paxMale}/${d.paxFemale}/${d.paxChild}/${d.paxInfant}.T.${totalLoad}.H- FWD&AFT.\nPAX.00/${d.paxTotal}.PAD.00/00`;
                } else {
                    // Standard Format (No newline before PAX)
                    loadLineDefault = `-${destination}.${d.paxMale}/${d.paxFemale}/${d.paxChild}/${d.paxInfant}.T.${totalLoad}${distsDefault}.PAX.00/${d.paxTotal}.PAD.00/00`;
                }

                ldm = `LDM\n\nBS${d.flightNoSuffix}/${formatDate(d.date, 'DDMONYY')}.${d.acRegLdm}.${seatConfig}.${d.configure}\n`+
                      `${loadLineDefault}\n\n` +
                      (siLines.length > 0 ? siLines.join('\n') : '') + `\n\nEND\n\n\n${dynamicRegards}`;
                break;
        }
        return ldm;
    }

    function generateFinalReport(reportData, messageContent, reportType, showRightPanel = true) {
        document.getElementById('left-report-content').innerHTML = messageContent;
        const rightReportDiv = document.getElementById('right-report');
        const printRightBtn = document.getElementById('print-right-btn');

        if (showRightPanel) {
             rightReportDiv.style.display = 'block';
             printRightBtn.style.display = 'block';

            if (reportType === 'ldm') {
                const ldmHtml = generateLdmForDestination(reportData);
                document.getElementById('right-report-content').innerHTML = `
                    <div id="printable-right">
                        <h2>FLIGHT LDM</h2>
                        <pre style="font-family: 'Bookman Old Style', serif; white-space: pre-wrap; word-wrap: break-word; font-size: 12px; text-transform: uppercase;">${ldmHtml}</pre>
                    </div>`;
                printRightBtn.textContent = 'PRINT LDM';
            } else {
                printRightBtn.textContent = 'PRINT REPORT';
                const formattedDate = reportData.date ? new Date(reportData.date + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'N/A';
                const routeParts = reportData.route.split('-');
                const origin = routeParts[0] || 'N/A';
                const destination = routeParts[1] || 'N/A';
                const passengerString = `LOAD-${reportData.flightLoad} &nbsp; ACTUAL-${reportData.paxMale}+${reportData.paxFemale}+${reportData.paxChild}+${reportData.paxInfant} =${reportData.paxTotal}+${reportData.paxInfant}`;
                const bagMailCgoString = `BAG: ${reportData.baggagePcs} PCS/${reportData.baggageWeight} KGS &nbsp; MAIL: ${reportData.mail} &nbsp; CGO: ${reportData.cargoPcs} PCS/${reportData.cargoWeight} KGS`;
                
                let specialHandlingParts = [];
                if (parseInt(reportData.maas) > 0) specialHandlingParts.push(`MAAS: ${reportData.maas}`);
                if (reportData.umPax && parseInt(reportData.umPax) > 0) specialHandlingParts.push(`UM: ${reportData.umPax}`);
                if (parseInt(reportData.vip) > 0) specialHandlingParts.push(`VIP: ${reportData.vip}`);
                if (parseInt(reportData.cip) > 0) specialHandlingParts.push(`CIP: ${reportData.cip}`);
                const specialHandlingOutput = specialHandlingParts.join(' / ') || 'NIL';

                const offloadParts = [];
                if (parseInt(reportData.gateNoShow) > 0) offloadParts.push(`GATE NO SHOW ${reportData.gateNoShow}`);
                if (parseInt(reportData.selfOffload) > 0) offloadParts.push(`SELF OFF ${reportData.selfOffload}`);
                if (reportType === 'intl') {
                    if (parseInt(reportData.refused) > 0) offloadParts.push(`REFUSED ${reportData.refused}`);
                    if (parseInt(reportData.immigrationOff) > 0) offloadParts.push(`IMMI OFF ${reportData.immigrationOff}`);
                }
                const offloadString = offloadParts.length > 0 ? offloadParts.join(', ') : 'NIL';
                
                const pnrRegex = /\b[A-Z0-9]{6}\b/g;
                const pnrs = reportData.remarks.match(pnrRegex);
                const noshowString = pnrs ? pnrs.join(', ') : 'NIL';
                
                const formattedReportHtml = `
                <div id="printable-right" style="font-family: 'Bookman Old Style', serif; color: black; padding: 10px; font-size: 11pt;">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <h2 style="margin: 0; font-size: 1.8em; font-weight: 700; letter-spacing: 1px;">US-BANGLA AIRLINES</h2>
                        <h3 style="margin: 5px 0 0 0; font-weight: 500; font-size: 1.3em; border-bottom: 2px solid black; padding-bottom: 5px;">FLIGHT DEPARTURE REPORT</h3>
                    </div>
                    <table style="width: 100%; border: 2px solid black; border-collapse: collapse; margin-top: 15px; font-size: 10pt;">
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px; width: 35%;">1. FLIGHT NO</td><td style="padding: 5px;">: ${reportData.flightNo} (${reportData.route})</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">2. DATE</td><td style="padding: 5px;">: ${formattedDate}</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">3. DEPARTURE TIME</td><td style="padding: 5px;">: STD: ${reportData.std} LT D/C: ${reportData.doorClosed} LT ATD: ${reportData.chocksOff} LT A/B: ${reportData.airborne} LT<br><span style="padding-left: 10px;">STATUS: ${reportData.departureStatus}</span></td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">4. A/C REGISTRATION</td><td style="padding: 5px;">: ${reportData.acReg} (${reportData.acType})</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">5. CAPTAIN</td><td style="padding: 5px;">: CAPT. ${reportData.captain} (${reportData.configure})</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">6. ORIGIN</td><td style="padding: 5px;">: ${origin}</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">7. DESTINATION</td><td style="padding: 5px;">: ${destination}</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">8. TOTAL PAX</td><td style="padding: 5px;">: ${passengerString}</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">9. TOTAL BAG/MAIL/CGO</td><td style="padding: 5px;">: ${bagMailCgoString}</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">10. CHECK IN STUFF</td><td style="padding: 5px;">: ${reportData.checkInStuff}</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">11. LOADING STUFF / G7</td><td style="padding: 5px;">: ${reportData.loadingStuff}</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">12. LOAD CONTROL</td><td style="padding: 5px;">: ${reportData.loadController}</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">13. FUEL (UPLIFT)</td><td style="padding: 5px;">: ${reportData.fuelUplift} KGS</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">14. PAX HANDLING</td><td style="padding: 5px;">: ${reportData.paxHandling}</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">15. VIP/CIP/MAAS/UM</td><td style="padding: 5px;">: ${specialHandlingOutput}</td></tr>
                        <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px; vertical-align: top;">REMARKS:</td><td style="padding: 5px;">: &bull; OFFLOAD: ${offloadString}<br>&bull; NOSHOW: ${noshowString}</td></tr>
                    </table>
                    <table style="width: 100%; border: 2px solid black; border-collapse: collapse; margin-top: 20px; font-size: 10pt;">
                       <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px; width: 35%;">PREPARED BY</td><td style="padding: 5px;">: ${reportData.userName}</td></tr>
                       <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px;">STUFF ID</td><td style="padding: 5px;">: USBA-${reportData.usbaId}</td></tr>
                       <tr style="border: 1px solid black;"><td style="font-weight: bold; padding: 5px; height: 35px;">SIGNATURE</td><td style="padding: 5px;">:</td></tr>
                    </table>
                </div>`;
                document.getElementById('right-report-content').innerHTML = formattedReportHtml;
            }

        } else {
            rightReportDiv.style.display = 'none';
            printRightBtn.style.display = 'none';
            document.getElementById('right-report-content').innerHTML = '';
        }
        showPage('dual-report-page');
    }
    
    generateReportBtnIntl.addEventListener('click', generateInternationalReport);
    generateReportBtnDom.addEventListener('click', generateDomesticReport);
    generateReportBtnLdm.addEventListener('click', generateLdmReport);
    
    printLeftBtn.addEventListener('click', () => {
         const leftReport = document.getElementById('left-report-content');
        leftReport.classList.add('printable');
        window.print();
        leftReport.classList.remove('printable');
    });

    printRightBtn.addEventListener('click', () => {
        const rightReport = document.getElementById('right-report-content');
        rightReport.classList.add('printable');
        window.print();
        rightReport.classList.remove('printable');
    });
});
