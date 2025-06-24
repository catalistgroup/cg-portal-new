export function parseUser(str: string) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return null;
  }
}

// Axios: error.response.data.message. -- deconstruct the error and get the message
export const getApiErrorMsg = (error: any) => {
  return (
    error?.response?.data?.message || error?.message || 'Something went wrong'
  );
};
