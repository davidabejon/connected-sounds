import { useEffect } from "react";

function Redirect({to = "/new"}) {
  useEffect(() => {
    window.location.href = to;
  })
}

export default Redirect;