const initialState = {
  user: null,
};
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGOUT_USER':
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
};
export default authReducer;