import React, { useState } from 'react';
import { View, Text } from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import GText from './GText';
import Colors from '../constants/color';

type PhoneInputProps = {
    onChange?: (countryCode: CountryCode, callingCode: string) => void;
};

const PhoneInput = ({ onChange }: PhoneInputProps) => {
    const [countryCode, setCountryCode] = useState<CountryCode>('VN');
    const [callingCode, setCallingCode] = useState('84');
    const [country, setCountry] = useState<Country | null>(null);

    const onSelect = (country: Country) => {
        setCountryCode(country.cca2);
        setCallingCode(country.callingCode[0]);
        setCountry(country);

        if (onChange) {
            onChange(country.cca2, country.callingCode[0]);
        }
    };

    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            // backgroundColor: Colors.main_bule,
            padding: 4,
            borderRadius: 5
        }}>
            <CountryPicker
                countryCode={countryCode}
                withCallingCode
                withFlag
                withFilter
                onSelect={onSelect}
            />
            <GText type='systemLight_14' color={Colors.black} style={{ marginLeft: -10 }}>+{callingCode}</GText>
        </View>
    );
};
export default PhoneInput;
