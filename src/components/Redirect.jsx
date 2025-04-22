import { useEffect } from "react";
import { newPath } from "../utilities";

function Redirect({to = newPath}) {
  useEffect(() => {
    window.location.href = to;
  })
}

export default Redirect;