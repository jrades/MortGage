"use strict";
(function () {

    function query(selector) {
        return document.body.querySelector(selector);
    }
    function queryAll(selector) {
        return document.body.querySelectorAll(selector);
    }

    const loanAmountInput = query('#mortLoanAmt');
    const downPaymentInput = query('#mortDownPayment');
    const interestRateInput = query('#mortInterestRate');
    const loanDurationInput = queryAll('input[name="mortLoanDuration"][type=radio]');
    const monthlyPaymentInput = query('#monthlyPayment');

    function getCheckedLoanDuration() {
        let radios = queryAll('input[name="loanDuration"][type="radio"]');
        let checkedRadios = Array.from(loanDurationInput).filter(function (radio) {
            return radio.checked;
        });
        if (checkedRadios.length > 0) {
            return checkedRadios[0].value;
        }
        return null;
    }


    const monthlyPaymentFunc = function (pv, mRate, np) {
        return ((mRate * pv * (Math.pow((1 + mRate), np))) / (Math.pow((1 + mRate), np) - 1));
    }

    const amortScheduleFunc = function (pv, mRate, np, mAmount) {
        var amortSchedule = [];
        var balance = pv;
        var tInterest = 0;
        var i;
        for (i = 0; i < np; i++) {
            var currentBalance = balance;
            var mInterest = (balance * mRate);
            var mPrincipal = (mAmount - mInterest);
            balance -= mPrincipal;
            tInterest += mInterest
            amortSchedule[i] =
                {
                    currentBalance: Number(currentBalance.toFixed(2)),
                    monthlyInterest: Number(mInterest.toFixed(2)),
                    monthlyPrincipal: Number(mPrincipal.toFixed(2)),
                    monthlyPayment: Number(mAmount.toFixed(2)),
                    remainingBalance: Number(balance.toFixed(2)),
                    totalInterestPaid: Number(tInterest.toFixed(2)),
                }
        }


        return amortSchedule;
    }

    // Calculator Object/Prototype Defintion

    function MortgageCalculator() {
        this.loanAmount = () => Number(loanAmountInput.value);
        this.downPayment = () => Number(downPaymentInput.value);
        this.interestRate = () => (Number(interestRateInput.value) / 100);
        this.monthlyInterestRate = () => ((Number(interestRateInput.value) / 100) / 12);
        this.loanDuration = () => Number(getCheckedLoanDuration());
    }

    MortgageCalculator.prototype.getMonthlyPayment = function () {
        let amountDue = this.loanAmount() - this.downPayment();
        return monthlyPaymentFunc(amountDue, this.monthlyInterestRate(), this.loanDuration());
    };

    MortgageCalculator.prototype.getAmortizationSchedule = function () {
        let pv = this.loanAmount() - this.downPayment();
        let amortSched = amortScheduleFunc(pv, this.monthlyInterestRate(), this.loanDuration(), this.getMonthlyPayment());
        return amortSched;
    };

    // Create a calculator object instance
    const myCalc = new MortgageCalculator();
    console.log(myCalc);

    // Function for updating the Amortization Schedule table

    // Form events
    function updatePayment(e) {
        monthlyPaymentInput.value = myCalc.getMonthlyPayment().toFixed(2);
    }
    // Input field onChange events
    loanAmountInput.addEventListener('change', updatePayment);
    downPaymentInput.addEventListener('change', updatePayment);
    interestRateInput.addEventListener('change', updatePayment);

    for (let i = 0; i < loanDurationInput.length; i++) {
        loanDurationInput[i].addEventListener('change', updatePayment);
    }

	// Calculate button onClick event
    let calcBtn = query('#calculateBtn');

    calcBtn.addEventListener('click', function (e) {
        updatePayment();
        updateTable();
    });

    function updateTable() {
        let tbl = query('#amortizationTbl');
        let tblBody = query('#amortizationTbl > tbody');

        try {

            let schedule = myCalc.getAmortizationSchedule();

            tblBody.innerHTML = '';

            for (let i = 0; i < schedule.length; i++) {
                let sched = schedule[i];

                let tr = document.createElement('tr'); //table row
                let td0 = document.createElement('td'); //month number
                let td1 = document.createElement('td'); //currentBalance
                let td2 = document.createElement('td'); //monthlyPayment
                let td3 = document.createElement('td'); //monthlyPrincipal
                let td4 = document.createElement('td'); //monthlyInterest
                let td5 = document.createElement('td'); //todalInterestPaid
                let td6 = document.createElement('td'); //remainingBalance
                td0.innerText = (i + 1);
                td1.innerText = ('$' + sched.currentBalance.toFixed(2));
                td2.innerText = ('$' + sched.currentBalance.toFixed(2));
                td3.innerText = ('$' + sched.currentBalance.toFixed(2));
                td4.innerText = ('$' + sched.currentBalance.toFixed(2));
                td5.innerText = ('$' + sched.currentBalance.toFixed(2));
                td6.innerText = ('$' + sched.currentBalance.toFixed(2));
                td0.className = "text-right";
                td1.className = "text-right";
                td2.className = "text-right";
                td3.className = "text-right";
                td4.className = "text-right";
                td5.className = "text-right";
                td6.className = "text-right";
                tr.appendChild(td0);
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);
                tr.appendChild(td5);
                tr.appendChild(td6);
                tblBody.appendChild(tr);

            }
        } catch (ex) {
            console.error(ex);
            tblBody.innerHTML = `<tr><td colspan="7">${ex}</td></tr>`;
        }
    }

})();
