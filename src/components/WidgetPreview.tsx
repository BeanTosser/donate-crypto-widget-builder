import React from "react";
import "../template/css/main.css";
import "../index.css";
import "../css/WidgetPreview.css";

type WidgetPreviewProps = {
    coinImage: string
}

const WidgetPreview = function(props: WidgetPreviewProps){
    return(
        <div className="donate-crypto-widget">
            <div className="coin-chooser-alternative">
                <div className="left-arrow coin-arrow-alternative"></div>
                <div className="arrow-divider"></div>
                <img src={props.coinImage} className="coin-logo-alternate" alt="coin 1"/>
                <div className="right-arrow coin-arrow-alternative"></div>
            </div>
        </div>
    )

}

export default WidgetPreview;