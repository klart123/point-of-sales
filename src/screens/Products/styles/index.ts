import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {},
  item: {
    flex: 1,
    margin: 3,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  modalCloseText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    // paddingHorizontal: 16,
  },
  addButton: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
    lineHeight: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonCancel: {
    padding: 10,
    marginRight: 8,
    backgroundColor: '#FF9800',
    borderRadius: 8,
  },
  buttonAdd: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
  },
});
