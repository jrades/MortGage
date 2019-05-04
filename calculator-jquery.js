"use strict";
(function () {

    // jQuery Selectors
	/*
	 * Loan Amount
	 * Down Payment
	 * Interest Rate
	 * Loan Duration
	 * Monthly Payment
	 */
    // Update selectors using valid jQuery syntax to match your selectors
    // These will not store values, but a reference to the HTML element itself
    // Note: radio and select inputs will involve different selector solutions
    const loanAmountInput = $('#mortLoanAmt');
    const downPaymentInput = $('#mortDownPayment');
    const interestRateInput = $('#mortInterestRate');
    const loanDurationInput = $('input[name="mortLoanDuration"]:radio');
    const monthlyPaymentInput = $('#monthlyPayment');

    console.log(loanAmountInput.val());
    console.log(downPaymentInput.val());
    console.log(interestRateInput.val());
    console.log(loanDurationInput.filter(':checked').val());
    console.log(monthlyPaymentInput.val());

    // Mortgage Functions

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
        this.loanAmount = () => Number(loanAmountInput.val());
        this.downPayment = () => Number(downPaymentInput.val());
        this.interestRate = () => (Number(interestRateInput.val()) / 100);
        this.monthlyInterestRate = () => ((Number(interestRateInput.val()) / 100) / 12);
        this.loanDuration = () => Number(loanDurationInput.filter(':checked').val());
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
        monthlyPaymentInput.val(myCalc.getMonthlyPayment().toFixed(2));
    }
    // Input field onChange events
    loanAmountInput.on('change', updatePayment);
    downPaymentInput.on('change', updatePayment);
    loanDurationInput.on('change', updatePayment);
    interestRateInput.on('change', updatePayment);
	// Calculate button onClick event
    let calcBtn = $('#calculateBtn');

    calcBtn.on('click', function (e) {
        updatePayment();
        updateTable();
    });

    function updateTable() {
        let tbl = $('#amortizationTbl');
        let tblBody = $('#amortizationTbl > tbody');

        try {
            tblBody.empty();

            let schedule = myCalc.getAmortizationSchedule();

            for (let i = 0; i < schedule.length; i++) {
                let sched = schedule[i];
                tblBody.append(`<tr>
<td>${i + 1}</td>
<td>${sched.currentBalance.toFixed(2)}</td >
<td>${sched.monthlyPayment.toFixed(2)}</td >
<td>${sched.monthlyPrincipal.toFixed(2)}</td >
<td>${sched.monthlyInterest.toFixed(2)}</td >
<td>${sched.totalInterestPaid.toFixed(2)}</td >
<td>${sched.remainingBalance.toFixed(2)}</td >
</tr>`);
            }
        } catch (ex) {
            console.error(ex)
            tblBody.empty();
            tblBody.append(`<tr><td colspan="7">${ex}</td></tr>`);
        }
    }

})();
