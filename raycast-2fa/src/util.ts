import { LocalStorage } from "@raycast/api";
import { generateToken } from "node-2fa";
export const STORAGE_KEY = "raycast-2fa-services";
export interface Service {
  name: string;
  code: string;
}
export const getToken = (code: string) => generateToken(code)?.token ?? "";
export const getStoredServices = () => {
  return LocalStorage.getItem(STORAGE_KEY).then((items) => {
    return items ? parseToServices(items as string) : [];
  });
};
export const addService = async (newService: Service) => {
  const items = (await LocalStorage.getItem(STORAGE_KEY)) as string;
  const entries = items ? parseToServices(items) : [];
  entries.push({ name: newService.name, code: newService.code });
  await LocalStorage.setItem(STORAGE_KEY, convertToBase64String(entries));
};
export const removeService = (services: Service[], serviceToDelete: Service) => {
  const newServices = services.filter((service) => service.code !== serviceToDelete.code);
  LocalStorage.setItem(STORAGE_KEY, convertToBase64String(newServices));
};

const parseToServices = (items: string) => {
  const buf = Buffer.from(items, "base64");
  return JSON.parse(buf.toString("utf8")) as Service[];
};

const convertToBase64String = (services: Service[]) => {
  const buf = Buffer.from(JSON.stringify(services), "utf8");
  return buf.toString("base64");
};
