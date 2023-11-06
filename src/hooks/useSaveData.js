export const useSaveData = (dispatch) => (type, response) =>
{
  if(!type|| !response)
  {
    throw new Error("got wrong parameters for useSaveData");
  }
  dispatch({
    type:'EMPLOYEE_ANSWER',
  });
}