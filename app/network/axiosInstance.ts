import axios, { type AxiosInstance } from "axios";

export const api: AxiosInstance = axios.create({
  baseURL: "http://192.168.15.17:8080/api/v1",
  headers: {
    Authorization:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJyZWFkZXItbWFuZ2EiLC" +
      "JpZCI6MSwicm9sZSI6IlVTRVIsQURNSU4iLCJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJl" +
      "eHAiOjE3NDM3MjE4NTh9.JL_SIerI72S95rTF_61WyaUxdxtV5fWQ791MgVab4fA",
  },
});
