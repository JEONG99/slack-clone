import axios from 'axios';

const fetcher = <Data>(url: string) => {
  return axios
    .get<Data>(url, {
      withCredentials: true,
    })
    .then((response) => {
      return response.data;
    });
};

export default fetcher;
