import { useEffect, useState } from "react";
import { exec } from "child_process";
import { ServiceList } from "./ServiceList";

export default function Command() {
  const [services, setServices] = useState<string[]>(["TC-Frida,199205302384"]);
  useEffect(() => {
    exec("sh " + __dirname + `/assets/getEntries.sh`, (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      if (stdout) {
        const items = !stdout.includes("No record found") ? stdout.toString().split(":") : undefined;
        if (items) {
          setServices(services.concat(items));
        }
      }
    });
  }, []);

  return <ServiceList services={services} />;
}
