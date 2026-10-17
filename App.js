
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

const today = new Date();
const TODAY_STRING = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-');

export default function App() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
  });

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(
    selectedDate || TODAY_STRING
  );
  const [yearInput, setYearInput] = useState(
    String(today.getFullYear())
  );

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSave = () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim()
    ) {
      showMessage(
        'Missing Information',
        'Please enter your first name, last name, and email address.'
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email.trim())) {
      showMessage(
        'Invalid Email',
        'Please enter a valid email address.'
      );
      return;
    }

    const message =
      `Name: ${form.firstName} ${form.lastName}\n` +
      `Birthday: ${form.birthday || 'Not provided'}\n` +
      `Gender: ${form.gender || 'Not selected'}\n` +
      `Email: ${form.email}\n` +
      `Phone: ${form.phone || 'Not provided'}\n` +
      `Address: ${form.address || 'Not provided'}`;

    showMessage('Personal Information Saved', message);
  };

  const renderInput = (
    label,
    field,
    placeholder,
    options = {}
  ) => (
    <View style={styles.field} key={field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          options.multiline && styles.multiline,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#9299A5"
        value={form[field]}
        onChangeText={(value) => updateField(field, value)}
        keyboardType={options.keyboardType || 'default'}
        autoCapitalize={options.autoCapitalize || 'sentences'}
        multiline={options.multiline || false}
      />
    </View>
  );

  const openCalendar = () => {
    const initialDate = selectedDate || TODAY_STRING;
    setCalendarMonth(initialDate);
    setYearInput(initialDate.substring(0, 4));
    setCalendarVisible(true);
  };

  const jumpToYear = () => {
    if (!/^\d{4}$/.test(yearInput)) {
      showMessage('Invalid Year', 'Please enter a four-digit year.');
      return;
    }

    const year = Number(yearInput);
    const currentYear = today.getFullYear();

    if (year < 1900 || year > currentYear) {
      showMessage(
        'Invalid Year',
        `Choose a year between 1900 and ${currentYear}.`
      );
      return;
    }

    // Keep the displayed month while jumping to the requested year.
    const month = calendarMonth.substring(5, 7) || '01';
    let targetMonth = `${year}-${month}-01`;

    // Do not navigate beyond the current month.
    const currentMonth = TODAY_STRING.substring(0, 7);
    if (targetMonth.substring(0, 7) > currentMonth) {
      targetMonth = `${currentYear}-${String(
        today.getMonth() + 1
      ).padStart(2, '0')}-01`;
      setYearInput(String(currentYear));
    }

    setCalendarMonth(targetMonth);
  };

  const selectBirthday = (day) => {
    const [year, month, date] = day.dateString
      .split('-')
      .map(Number);

    const formattedDate = new Date(
      year,
      month - 1,
      date
    ).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    setSelectedDate(day.dateString);
    updateField('birthday', formattedDate);
    setCalendarMonth(day.dateString);
    setCalendarVisible(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>

        <Text style={styles.title}>Personal Information</Text>

        <Text style={styles.subtitle}>
          Please fill in your personal details below.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Basic Information
        </Text>

        {renderInput(
          'First Name *',
          'firstName',
          'Enter your first name'
        )}

        {renderInput(
          'Last Name *',
          'lastName',
          'Enter your last name'
        )}

        {/* Birthday field */}
        <View style={styles.field}>
          <Text style={styles.label}>Birthday</Text>

          <TouchableOpacity
            style={styles.birthdayInput}
            onPress={openCalendar}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.birthdayText,
                !form.birthday && styles.placeholderText,
              ]}
            >
              {form.birthday || 'Select your birthday'}
            </Text>

            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Birthday calendar modal */}
        <Modal
          visible={calendarVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCalendarVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarCard}>
              <Text style={styles.calendarTitle}>
                Select Your Birthday
              </Text>

              <Text style={styles.calendarSubtitle}>
                Enter your birth year, then select the month and day.
              </Text>

              {/* Jump directly to a year */}
              <View style={styles.yearPickerRow}>
                <Text style={styles.yearLabel}>Birth year:</Text>

                <TextInput
                  style={styles.yearInput}
                  value={yearInput}
                  keyboardType="number-pad"
                  maxLength={4}
                  selectTextOnFocus
                  onChangeText={(value) => {
                    if (/^\d{0,4}$/.test(value)) {
                      setYearInput(value);
                    }
                  }}
                  onSubmitEditing={jumpToYear}
                  returnKeyType="go"
                />

                <TouchableOpacity
                  style={styles.goButton}
                  onPress={jumpToYear}
                >
                  <Text style={styles.goButtonText}>Go</Text>
                </TouchableOpacity>
              </View>

              <Calendar
                key={calendarMonth.substring(0, 7)}
                current={calendarMonth}
                maxDate={TODAY_STRING}
                minDate="1900-01-01"
                onMonthChange={(month) => {
                  setCalendarMonth(month.dateString);
                  setYearInput(month.year.toString());
                }}
                onDayPress={selectBirthday}
                enableSwipeMonths
                markedDates={
                  selectedDate
                    ? {
                        [selectedDate]: {
                          selected: true,
                          selectedColor: '#4169E1',
                        },
                      }
                    : {}
                }
                theme={{
                  backgroundColor: '#FFFFFF',
                  calendarBackground: '#FFFFFF',
                  todayTextColor: '#4169E1',
                  arrowColor: '#4169E1',
                  monthTextColor: '#1E2A44',
                  selectedDayBackgroundColor: '#4169E1',
                  selectedDayTextColor: '#FFFFFF',
                  textDayFontSize: 14,
                  textMonthFontSize: 17,
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                }}
              />

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCalendarVisible(false)}
              >
                <Text style={styles.closeButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Gender selection */}
        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>

          <View style={styles.genderRow}>
            {[
              'Male',
              'Female',
              'Prefer not to say',
            ].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.genderButton,
                  form.gender === item && styles.genderSelected,
                ]}
                onPress={() => updateField('gender', item)}
              >
                <Text
                  style={[
                    styles.genderText,
                    form.gender === item &&
                      styles.genderTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Contact Information
        </Text>

        {renderInput(
          'Email Address *',
          'email',
          'example@email.com',
          {
            keyboardType: 'email-address',
            autoCapitalize: 'none',
          }
        )}

        {renderInput(
          'Phone Number',
          'phone',
          'Enter your phone number',
          {
            keyboardType: 'phone-pad',
          }
        )}

        {renderInput(
          'Home Address',
          'address',
          'Enter your complete address',
          {
            multiline: true,
          }
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            Save Information
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>* Required fields</Text>
      </View>

      <Text style={styles.footer}>
        Shelly • Personal Information Form
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F5FA',
  },

  container: {
    padding: 20,
    alignItems: 'center',
  },

  header: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#DDE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  avatarText: {
    fontSize: 34,
  },

  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#1E2A44',
    textAlign: 'center',
  },

  subtitle: {
    color: '#6B7485',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EAF2',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#273B67',
    marginTop: 8,
    marginBottom: 18,
  },

  field: {
    marginBottom: 17,
  },

  label: {
    color: '#35415A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#DCE2EC',
    backgroundColor: '#FAFBFD',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#202B40',
    fontSize: 15,
  },

  multiline: {
    minHeight: 85,
    textAlignVertical: 'top',
  },

  birthdayInput: {
    width: '100%',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#DCE2EC',
    backgroundColor: '#FAFBFD',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  birthdayText: {
    color: '#202B40',
    fontSize: 15,
  },

  placeholderText: {
    color: '#9299A5',
  },

  calendarIcon: {
    fontSize: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  calendarCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    elevation: 8,
  },

  calendarTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1E2A44',
    marginBottom: 6,
    textAlign: 'center',
  },

  calendarSubtitle: {
    fontSize: 13,
    color: '#6B7485',
    textAlign: 'center',
    marginBottom: 12,
  },

  yearPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },

  yearLabel: {
    fontSize: 14,
    color: '#35415A',
    fontWeight: '600',
  },

  yearInput: {
    width: 90,
    height: 42,
    borderWidth: 1,
    borderColor: '#4169E1',
    borderRadius: 8,
    backgroundColor: '#F5F7FF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E2A44',
  },

  goButton: {
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  goButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  closeButton: {
    backgroundColor: '#EEF2FA',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },

  closeButtonText: {
    color: '#4169E1',
    fontWeight: 'bold',
    fontSize: 15,
  },

  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  genderButton: {
    borderWidth: 1,
    borderColor: '#DCE2EC',
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: '#FAFBFD',
  },

  genderSelected: {
    backgroundColor: '#E7EEFF',
    borderColor: '#4169E1',
  },

  genderText: {
    fontSize: 13,
    color: '#4B5568',
  },

  genderTextSelected: {
    color: '#3158C8',
    fontWeight: 'bold',
  },

  saveButton: {
    backgroundColor: '#4169E1',
    borderRadius: 10,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  note: {
    color: '#858D9B',
    fontSize: 12,
    marginTop: 14,
  },

  footer: {
    color: '#9299A5',
    fontSize: 12,
    marginTop: 22,
    marginBottom: 12,
  },
});
