import { useEffect, useState } from "react";
import { ServiceList } from "./ServiceList";
import { getStoredServices, Service } from "./util";

export default function Command() {
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => {
    getStoredServices().then((s) => setServices(s));
  }, []);

  return <ServiceList services={services} />;
}
