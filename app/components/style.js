import { Platform, StyleSheet, useColorScheme } from 'react-native'
import styled from 'styled-components/native'

const DARK_COLORS = {
  color1: { background: '#212529', text: '#FFFFFF' },
  color2: { background: '#343a40', text: 'white' },
  color3: { background: '#495057', text: 'white' },
  color4: { background: '#6c757d', text: 'white' },
  color5: { background: '#adb5bd', text: 'black' },
  color6: { background: '#ced4da', text: 'black' }
}

const LIGHT_COLORS = {
  color1: { background: '#f8f9fa', text: '#000000' },
  color2: { background: '#e9ecef', text: 'black' },
  color3: { background: '#dee2e6', text: 'black' },
  color4: { background: '#ced4da', text: 'black' },
  color5: { background: '#adb5bd', text: 'black' },
  color6: { background: '#6c757d', text: 'white' }
}

export function useDefaultStyleSheet () {
  const scheme = useColorScheme()
  const dark = scheme === 'dark'

  const colors = dark ? DARK_COLORS : LIGHT_COLORS
  const textInfoColor = '#0A7AC3'
  const textPrimaryColor = dark ? 'white' : textInfoColor
  const textPrimaryAndSecondaryColor = dark ? '#3BB54A' : textInfoColor
  const textPrimaryDarkColor = dark ? '#000080' : '#FFFFFF'
  const textPrimaryLightColor = dark ? '#FFFFFF' : '#000080'
  const textSuccessColor = '#3BB54A'
  const textWarningColor = '#F9A146'
  const textDangerColor = 'red'
  const disabled = dark ? '#DDDDDD' : '#A9A9A9'
  const pickerItemColor = Platform.OS === 'ios' ? (dark ? 'white' : 'black') : 'black'
  const backgroundColorHeight = dark ? '#f8f9fa' : '#212529'
  const backgroundColorFundoModal = dark ? '#FFFFFF20' : '#00000040'

  return {
    dark,
    backgroundColor: colors.color1.background,
    placeholderTextColor: colors.color5.background,
    textColorBase: colors.color1.text,
    textInfoColor,
    textPrimaryColor,
    textDangerColor,
    textPrimaryAndSecondaryColor,
    textSuccessColor,
    textWarningColor,
    textPrimaryDarkColor,
    textPrimaryLightColor,
    disabled,
    colors,
    pickerItemColor,
    backgroundColorHeight,
    backgroundColorFundoModal,
    defaultStyle: StyleSheet.create({
      listItem: {
        padding: 10,
        paddingVertical: 5
      },
      nav: {
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingTop: 30,
        paddingBottom: 10,
        backgroundColor: colors.color2.background,
        justifyContent: 'space-between'
      },
      background1: {
        backgroundColor: colors.color1.background,
        color: colors.color1.text
      },
      background2: {
        backgroundColor: colors.color2.background,
        color: colors.color2.text
      },
      background3: {
        backgroundColor: colors.color3.background,
        color: colors.color3.text
      },
      background4: {
        backgroundColor: colors.color4.background,
        color: colors.color4.text
      },
      background5: {
        backgroundColor: colors.color5.background,
        color: colors.color5.text
      },
      background6: {
        backgroundColor: colors.color6.background,
        color: colors.color6.text
      },
      text: {
        color: colors.color1.text
      },
      textBold: {
        color: colors.color1.text,
        fontWeight: 'bold'
      },
      textPrimary: {
        color: textPrimaryColor
      },
      input: {
        backgroundColor: colors.color2.background,
        color: colors.color1.text,
        height: 35,
        paddingLeft: 5,
        paddingRight: 5,
        borderColor: colors.color4.background,
        borderWidth: 0.7,
        borderRadius: 5
      },
      viewPicker: {
        justifyContent: 'center',
        backgroundColor: colors.color2.background,
        color: colors.color6.background,
        height: Platform.OS === 'ios' ? 120 : 35,
        paddingLeft: 2,
        paddingRight: 2,
        borderColor: colors.color4.background,
        borderWidth: 0.7,
        borderRadius: 5
      },
      inputPicker: {
        color: '#6c757d'
      },
      itemStyle: {
        height: 120,
        color: pickerItemColor
      },
      itemStyleDisabled: {
        height: 120,
        color: '#6c757d'
      },
      lineDivider: {
        marginVertical: 2,
        backgroundColor: 'transparent'
      },
      buttonSuccess: {
        backgroundColor: textSuccessColor,
        alignItems: 'center',
        padding: 10,
        borderRadius: 3
      },
      buttonDisabled: {
        backgroundColor: disabled,
        alignItems: 'center',
        padding: 10,
        borderRadius: 3
      },
      buttonDanger: {
        backgroundColor: textDangerColor,
        alignItems: 'center',
        padding: 10,
        borderRadius: 3
      },
      buttonPrimary: {
        backgroundColor: textInfoColor,
        alignItems: 'center',
        padding: 10,
        borderRadius: 3
      },
      buttonWarning: {
        backgroundColor: textWarningColor,
        alignItems: 'center',
        padding: 10,
        borderRadius: 3
      },
      buttonText: {
        color: 'white'
      }
    })
  }
}

export const SafeAreaView1 = styled.SafeAreaView`
  background-color: ${props => props.theme.colors.color1.background};
  flex: 1;
`

export const SafeAreaView2 = styled.SafeAreaView`
  background-color: ${props => props.theme.colors.color2.background};
  flex: 1;
`

export const SafeAreaView3 = styled.SafeAreaView`
  background-color: ${props => props.theme.colors.color3.background};
  flex: 1;
`

export const SafeAreaView4 = styled.SafeAreaView`
  background-color: ${props => props.theme.colors.color4.background};
  flex: 1;
`

export const SafeAreaView5 = styled.SafeAreaView`
  background-color: ${props => props.theme.colors.color5.background};
  flex: 1;
`

export const SafeAreaView6 = styled.SafeAreaView`
  background-color: ${props => props.theme.colors.color6.background};
  flex: 1;
`

export const Container1 = styled.View`
  background-color: ${props => props.theme.colors.color1.background};
  flex: 1;
`

export const Container2 = styled(Container1)`
  background-color: ${props => props.theme.colors.color2.background};
`

export const Container3 = styled(Container1)`
  background-color: ${props => props.theme.colors.color3.background};
`

export const Container4 = styled(Container1)`
  background-color: ${props => props.theme.colors.color4.background};
`

export const Container5 = styled(Container1)`
  background-color: ${props => props.theme.colors.color5.background};
`

export const Container6 = styled(Container1)`
  background-color: ${props => props.theme.colors.color6.background};
`

export const ContainerPicker = styled.TouchableOpacity`
  justify-content: center;
  background-color: ${props => props.theme.colors.color2.background};
  color: ${props => props.theme.colors.color6.background};
  height: ${Platform.OS === 'ios' ? '120px' : '35px'};
  padding-left: 2px;
  padding-right: 2px;
  border-color: ${props => props.theme.colors.color4.background};
  border-width: 0.7px;
  border-radius: 5px;
`

export const ContainerPickerView = styled.View`
  justify-content: center;
  background-color: ${props => props.theme.colors.color2.background};
  color: ${props => props.theme.colors.color6.background};
  height: ${Platform.OS === 'ios' ? '120px' : '35px'};
  padding-left: 2px;
  padding-right: 2px;
  border-color: ${props => props.theme.colors.color4.background};
  border-width: 0.7px;
  border-radius: 5px;
`

export const PickerDisabled = styled.View`
  color: #6c757d;
`

export const InputDisabled = styled.TextInput`
  color: #6c757d;
`

export const TextRoboto = styled.Text`
  font-family: Roboto-Regular;
`

export const LabelWhite = styled(TextRoboto)`
  color: white;
`

export const Label = styled(TextRoboto)`
  color: ${props => props.theme.colors.color1.text};
`

export const Label18 = styled(Label)`
  color: ${props => props.theme.colors.color1.text};
  font-size: 18px;
`

export const LabelBold = styled(Label)`
  font-family: Roboto-Bold;
  font-weight: bold;
`

export const Label18Bold = styled(Label18)`
  font-family: Roboto-Bold;
  font-weight: bold;
`

export const LabelRequired = styled(TextRoboto)`
  color: red;
`

export const LabelValidation = styled(LabelRequired)`
  font-size: 10px;
`

export const LabelPrimary = styled(TextRoboto)`
  color: ${props => props.theme.textPrimaryColor};
`

export const LabelInfo = styled(TextRoboto)`
  color: ${props => props.theme.textInfoColor};
`

export const ListItem = styled.View`
  padding: 10px;
  paddingVertical: 5px;
`

export const ListItem1 = styled(ListItem)`
  backgroundColor: ${props => props.theme.colors.color1.background};
`

export const ListItem2 = styled(ListItem)`
  backgroundColor: ${props => props.theme.colors.color2.background};
`

export const ListItem3 = styled(ListItem)`
  backgroundColor: ${props => props.theme.colors.color3.background};
`

export const ListItem4 = styled(ListItem)`
  backgroundColor: ${props => props.theme.colors.color4.background};
`

export const ListItem5 = styled(ListItem)`
  backgroundColor: ${props => props.theme.colors.color5.background};
`

export const ListItem6 = styled(ListItem)`
  backgroundColor: ${props => props.theme.colors.color6.background};
`

export const ListItemButtom = styled.TouchableOpacity`
  padding: 10px;
  paddingVertical: 5px;
`

export const ListItemButtom1 = styled(ListItemButtom)`
  backgroundColor: ${props => props.theme.colors.color1.background};
`

export const ListItemButtom2 = styled(ListItemButtom)`
  backgroundColor: ${props => props.theme.colors.color2.background};
`

export const ListItemButtom3 = styled(ListItemButtom)`
  backgroundColor: ${props => props.theme.colors.color3.background};
`

export const ListItemButtom4 = styled(ListItemButtom)`
  backgroundColor: ${props => props.theme.colors.color4.background};
`

export const ListItemButtom5 = styled(ListItemButtom)`
  backgroundColor: ${props => props.theme.colors.color5.background};
`

export const ListItemButtom6 = styled(ListItemButtom)`
  backgroundColor: ${props => props.theme.colors.color6.background};
`

export const FormFilter = styled.View`
  padding: 10px;
  backgroundColor: ${props => props.theme.colors.color1.background};
`

export const Card = styled.TouchableOpacity`
  border-radius: 5px;
  margin: 10px;
  padding: 10px;
  paddingVertical: 5px;
`

export const Card1 = styled(Card)`
  backgroundColor: ${props => props.theme.colors.color1.background};
`

export const Card2 = styled(Card)`
  backgroundColor: ${props => props.theme.colors.color2.background};
`

export const Card3 = styled(Card)`
  backgroundColor: ${props => props.theme.colors.color3.background};
`

export const Card4 = styled(Card)`
  backgroundColor: ${props => props.theme.colors.color4.background};
`

export const Card5 = styled(Card)`
  backgroundColor: ${props => props.theme.colors.color5.background};
`

export const Card6 = styled(Card)`
  backgroundColor: ${props => props.theme.colors.color6.background};
`

export const Input = styled.TextInput`
  font-family: Roboto-Bold;
  backgroundColor: ${props => props.theme.colors.color2.background};
  color: ${props => props.theme.colors.color1.text};
  height: 35px;
  paddingLeft: 5px;
  paddingRight: 5px;
  borderColor: ${props => props.theme.colors.color4.background};
  borderWidth: 0.7px;
  borderRadius: 5px;
`

export const ViewInput = styled.View`
  backgroundColor: ${props => props.theme.colors.color2.background};
  color: ${props => props.theme.colors.color1.text};
  height: 35px;
  paddingLeft: 5px;
  paddingRight: 5px;
  borderColor: ${props => props.theme.colors.color4.background};
  borderWidth: 0.7px;
  borderRadius: 5px;
`

export const Button = styled.TouchableOpacity`
  align-items: center;
  padding: 10px;
  border-radius: 3px;
`

export const ButtonWarning = styled(Button)`
  backgroundColor: ${props => props.theme.textWarningColor};
`

export const ButtonDanger = styled(Button)`
  backgroundColor: ${props => props.theme.textDangerColor};
`

export const ButtonSuccess = styled(Button)`
  backgroundColor: ${props => props.theme.textSuccessColor};
`

export const ButtonPrimary = styled(Button)`
  backgroundColor: ${props => props.theme.textInfoColor};
`

export const ButtonDisabled = styled(Button)`
  backgroundColor: ${props => props.theme.disabled};
`

export const ButtonResetFilter = styled.TouchableOpacity`
  background-color: #da4234;
  borderRadius: 5px;
  padding: 5px;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
`

export const NavBarView = styled.View`
  display: flex;
  flex-direction: row;
  padding-horizontal: 8px;
  padding-top: 30px;
  padding-bottom: 10px;
  background-color: ${props => props.theme.colors.color2.background};
  justify-content: space-between;
`

export const ScrollView1 = styled.ScrollView`
  background-color: ${props => props.theme.colors.color1.background};
  color: ${props => props.theme.colors.color1.text};
`

export const ScrollView2 = styled.ScrollView`
  background-color: ${props => props.theme.colors.color2.background};
  color: ${props => props.theme.colors.color2.text};
`

export const ScrollView3 = styled.ScrollView`
  background-color: ${props => props.theme.colors.color3.background};
  color: ${props => props.theme.colors.color3.text};
`

export const ScrollView4 = styled.ScrollView`
background-color: ${props => props.theme.colors.color4.background};
color: ${props => props.theme.colors.color4.text};
`

export const ScrollView5 = styled.ScrollView`
background-color: ${props => props.theme.colors.color5.background};
color: ${props => props.theme.colors.color5.text};
`

export const ScrollView6 = styled.ScrollView`
  background-color: ${props => props.theme.colors.color6.background};
  color: ${props => props.theme.colors.color6.text};
`

export const FlatList1 = styled.FlatList`
  background-color: ${props => props.theme.colors.color1.background};
`

export const FlatList2 = styled.FlatList`
  background-color: ${props => props.theme.colors.color2.background};
`

export const FlatList3 = styled.FlatList`
  background-color: ${props => props.theme.colors.color3.background};
`

export const FlatList4 = styled.FlatList`
  background-color: ${props => props.theme.colors.color4.background};
`

export const FlatList5 = styled.FlatList`
  background-color: ${props => props.theme.colors.color6.background};
`

export const FlatList6 = styled.FlatList`
  background-color: ${props => props.theme.colors.color6.background};
`
