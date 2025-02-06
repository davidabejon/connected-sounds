import { InfoCircleOutlined } from "@ant-design/icons";
import { ColorPicker, Popover, Switch } from "antd";
import { IoLayersOutline } from "react-icons/io5";

function Settings({ showInfo, pointColor, setPointColor, setIsVisibleStars }) {

  const colorOnChange = value => {
    setPointColor(value.toHexString())
    document.getElementById('crosshair').style.borderColor = value.toHexString()
  }

  return (
    <div className="top-right-btns">
      <Popover placement="leftBottom" content={
        <div className="d-flex flex-column gap-2">
          <h4>Map options</h4>
          <div className="d-flex gap-2 justify-content-between">
            <p>Toggle stars</p>
            <Switch onChange={setIsVisibleStars} />
          </div>
          <div className="d-flex gap-2 justify-content-between">
            <p>Change color</p>
            <ColorPicker trigger="hover" value={pointColor} onChange={colorOnChange} />
          </div>
        </div>
      }>
        <button className="map-layers"><IoLayersOutline size={48} color="white" /></button>
      </Popover>
      <button className="info-btn" onClick={showInfo}><InfoCircleOutlined style={{ fontSize: '2.5em', color: 'white' }} /></button>
    </div>
  );
}

export default Settings;