const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const obj = {};
let material = "RAW";

// Select all input fields
const inputFields = document.querySelectorAll("input");

// Add event listeners to input fields to update obj
inputFields.forEach((inputField) => {
    inputField.addEventListener("change", () => {
        obj[inputField.id] = inputField.value;
        calculateTotal();
    });
});

// Calculate actual rate when invoice rate changes
const invoiceRate = document.querySelector("#invoice-rate");
invoiceRate.addEventListener("change", () => {
    const actualRate = document.querySelector("#actual-rate");
    actualRate.value = (parseFloat(invoiceRate.value) / 1.05).toFixed(2);
    obj["actual-rate"] = actualRate.value;
    calculateTotal();
});

// Set invoice date to current date
const invoiceDate = document.querySelector("#invoice-date");
const date = new Date();
obj["invoice-date"] = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
invoiceDate.value = obj["invoice-date"];

// Update material when selected
document.querySelector("select").addEventListener("change", () => {
    material = document.querySelector("select").value;
    obj["material"] = material;
    calculateTotal();
});

// Calculate oil difference
const oilCondition = document.querySelector("#oil-condition");
const oilResult = document.querySelector("#oil-result");
oilResult.addEventListener("change", () => {
    if (oilCondition.value.length !== 0) {
        obj["oil-diff"] = (parseFloat(oilCondition.value) - parseFloat(oilResult.value)).toFixed(2);
        document.querySelector("#oil-diff").value = obj["oil-diff"];
        calculateTotal();
    }
});

// Calculate FFA difference
const FFACondition = document.querySelector("#ffa-condition");
const FFAResult = document.querySelector("#ffa-result");
FFAResult.addEventListener("change", () => {
    calculateFFADifference();
    calculateTotal();
});

const FFARebeat = document.querySelector("#ffa-rebeat");
FFARebeat.addEventListener("change", ()=> {
    calculateFFADeduction();
    calculateTotal();
});

// Set default value for broker
const brokerField = document.querySelector("#broker");
brokerField.value = "WISE CREDENCE";
brokerField.disabled = true;

// Calculate total and other values based on unloading charge
const total1 = document.querySelector("#total1");
const perBag = document.querySelector("#per-bag");
const unload = document.querySelector("#unload-charge");
const total2 = document.querySelector("#total2");
const cgst = document.querySelector("#cgst");
const sgst = document.querySelector("#sgst");
const net = document.querySelector("#net");

perBag.addEventListener("change", () => {
    obj["unload-charge"] = parseFloat(perBag.value) * parseInt(obj["bags-recieved"]);
    unload.value = obj["unload-charge"];
    calculateTotal();
    total2.value = parseFloat(obj["total2"]).toFixed(2);
});

// Calculate cost of rice bran when kgs or bags received changes
const kgsReceived = document.querySelector("#kgs-recieved");
const bagsReceived = document.querySelector("#bags-recieved");
const actualRate = document.querySelector("#actual-rate");

kgsReceived.addEventListener("change", () => {
    calculateCostOfRiceBran();
});

bagsReceived.addEventListener("change", () => {
    calculateCostOfRiceBran();
});

// Calculate oil deduction when oil result or oil condition changes
oilCondition.addEventListener("change", () => {
    calculateOilDeduction();
});

oilResult.addEventListener("change", () => {
    calculateOilDeduction();
});

function calculateOilDeduction() {
    const kgsReceivedValue = parseFloat(kgsReceived.value);
    const bagsReceivedValue = parseFloat(bagsReceived.value);
    const oilConditionValue = parseFloat(oilCondition.value);
    const oilResultValue = parseFloat(oilResult.value);
    const actualRateValue = parseFloat(actualRate.value);

    if (!isNaN(kgsReceivedValue) && !isNaN(bagsReceivedValue) && !isNaN(oilConditionValue) && !isNaN(oilResultValue) && !isNaN(actualRateValue)) {
        const oilDeductionValue = (parseFloat(total1.value) - ((kgsReceivedValue - bagsReceivedValue) / 100) * (oilResultValue / oilConditionValue) * actualRateValue).toFixed(2);
        document.querySelector("#oil-deduction").value = oilDeductionValue;
        obj["oil-deduction"] = oilDeductionValue;
    }
}

function calculateFFADeduction() {
    const kgsReceivedValue = parseFloat(kgsReceived.value);
    const bagsReceivedValue = parseFloat(bagsReceived.value);
    const FFARebateValue = parseFloat(document.querySelector("#ffa-rebeat").value);

    if (!isNaN(kgsReceivedValue) && !isNaN(bagsReceivedValue) && !isNaN(FFARebateValue)) {
        const FFADeductionValue = ((kgsReceivedValue - bagsReceivedValue) / 100) * FFARebateValue;
        document.querySelector("#ffa-deduction").value = FFADeductionValue.toFixed(2);
        obj["ffa-deduction"] = FFADeductionValue.toFixed(2);
    }
}

function calculateCostOfRiceBran() {
    const kgsReceivedValue = parseFloat(kgsReceived.value);
    const bagsReceivedValue = parseFloat(bagsReceived.value);
    const actualRateValue = parseFloat(actualRate.value);

    if (!isNaN(kgsReceivedValue) && !isNaN(bagsReceivedValue) && !isNaN(actualRateValue)) {
        const costOfRiceBran = ((kgsReceivedValue - bagsReceivedValue) / 100) * actualRateValue;
        document.querySelector("#total1").value = costOfRiceBran.toFixed(2);
        obj["total1"] = costOfRiceBran.toFixed(2);
    }
}

function calculateFFADifference() {
    const FFAConditionValue = parseFloat(FFACondition.value);
    const FFAResultValue = parseFloat(FFAResult.value);

    if (!isNaN(FFAConditionValue) && !isNaN(FFAResultValue)) {
        const FFADifference = FFAResultValue - FFAConditionValue;
        document.querySelector("#ffa-diff").value = FFADifference.toFixed(2);
        obj["ffa-diff"] = FFADifference.toFixed(2);
    }
}

// Calculate total and other values based on unloading charge, oil deduction, and FFA deduction
const calculateTotal = () => {
    const costOfRiceBranValue = parseFloat(total1.value);
    const unloadValue = parseFloat(unload.value);
    const oilDeductionValue = parseFloat(document.querySelector("#oil-deduction").value);
    const ffaDeductionValue = parseFloat(document.querySelector("#ffa-deduction").value);

    if (!isNaN(costOfRiceBranValue) && !isNaN(unloadValue) && !isNaN(oilDeductionValue) && !isNaN(ffaDeductionValue)) {
        obj["total2"] = (costOfRiceBranValue - unloadValue - oilDeductionValue - ffaDeductionValue).toFixed(2);
    }

    // Update cgst, sgst, and net
    cgst.value = (parseFloat(obj["total2"]) * 0.025).toFixed(2);
    obj["cgst"] = cgst.value;

    sgst.value = cgst.value;
    obj["sgst"] = sgst.value;

    net.value = (parseFloat(obj["total2"]) + parseFloat(obj["cgst"]) + parseFloat(obj["sgst"])).toFixed(2);
    obj["net"] = net.value;
};
