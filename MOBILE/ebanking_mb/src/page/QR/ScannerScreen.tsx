import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList} from "../../navigation/types";
import QRScanner from "./QRScanner";
import { Button, View } from "react-native";

type Props = StackScreenProps<RootStackParamList, "ScannerScreen">;

export default function ScannerScreen({ navigation, route }: Props) {
  const { onScanSuccess } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <QRScanner
        onScanSuccess={(value) => {
          onScanSuccess(value);
          navigation.goBack();
        }}
      />

      <Button title="Đóng" onPress={() => navigation.goBack()} />
    </View>
  );
}
