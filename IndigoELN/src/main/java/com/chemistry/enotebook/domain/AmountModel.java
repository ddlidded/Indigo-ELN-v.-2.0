package com.chemistry.enotebook.domain;

import com.chemistry.enotebook.experiment.common.units.UnitType;
import com.chemistry.enotebook.experiment.datamodel.common.Amount2;

public class AmountModel extends Amount2 {

    public static final long serialVersionUID = 7526472295622776147L;

    public AmountModel() {
        //This is a wrong constructor to use. Initialize with Unit Type.
    }

    public AmountModel(UnitType unitType) {
        super(unitType);
    }

    public AmountModel(UnitType unitType, double defaultVal, double value) {
        super(unitType, value, defaultVal + "");
    }

    public AmountModel(UnitType unitType, double value) {
        super(unitType, value);
    }

    public AmountModel(UnitType unitType, double value, boolean isCalculated) {
        super(unitType, value, isCalculated);
    }

    public AmountModel(UnitType unitType, String defaultVal) {
        super(unitType, defaultVal);
    }

    @Override
    public void deepCopy(Object source) {
        if (source instanceof AmountModel) {
            AmountModel src = (AmountModel) source;
            setValue(src.getValue());
            setDisplayedFigs(src.getDisplayedFigs());
            setSigDigitsSet(src.getSigDigitsSet());
            setSigDigits(src.getSigDigits());
            setUserPrefFigs(src.getUserPrefFigs());
            setCalculated(src.isCalculated());
            getUnit().deepCopy(src.getUnit());
            setCanBeDisplayed(src.isCanBeDisplayed());
        }
    }

    @Override
    public boolean equals(Object amtObj) {
        if (amtObj == null){
            return false;
        }
        AmountModel amtModel = (AmountModel) amtObj;
        // vb 7/15 value was == so always returned false
        // isCalculated and sigDigits were not included
        // Leave as separate lines for debugging if necessary

        //NS 7/23. Fix to load empty value Amount Record from DB to model.
        return this.getValue().equals(amtModel.getValue()) &&
                this.isCalculated() == amtModel.isCalculated() &&
                this.getSigDigits() == amtModel.getSigDigits() &&
                this.getUnit().getCode().equals(amtModel.getUnit().getCode());
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + (this.getValue() != null ? this.getValue().hashCode() : 0);
        result = 31 * result + (this.isCalculated() ? 1 : 0);
        result = 31 * result + this.getSigDigits();
        result = 31 * result + (this.getUnit().getCode() != null ? this.getUnit().getCode().hashCode() : 0);
        return result;
    }

    @Override
    public Object deepClone() {

        AmountModel amtModel = new AmountModel(getUnit().getType());
        amtModel.setUnit(getUnit());
        amtModel.setCalculated(isCalculated());
        amtModel.setValue(getValue());
        amtModel.setDefaultValue(getDefaultValue());
        // vb 10/20/08 to set the sig figs when user enters a measurement
        amtModel.setSigDigits(this.getSigDigits());
        return amtModel;
    }

    boolean equalsByValueAndUnits(Object amtObj) {
        if (amtObj == null) {
            return false;
        }
        AmountModel amtModel = (AmountModel) amtObj;
        // to avoid .10 not equal to .100 when compared by getValue()
        return this.getValueForDisplay().equals(amtModel.getValueForDisplay()) && this.getUnit().getStdCode().equals(amtModel.getUnit().getStdCode());
    }

}