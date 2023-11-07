import { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import { PLUGIN_LOGO_ICON_COMPONENTS } from "metabase/plugins";

class DefaultLogoIcon extends Component {
  static defaultProps = {
    height: 32,
  };
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    dark: PropTypes.bool,
  };

  render() {
    const { dark, height, width } = this.props;
    return (
      <svg
        className={cx(
          "Icon",
          "icon-master",
          { "text-brand": !dark },
          { "text-white": dark },
        )}
        // viewBox="0 0 66 85"
        viewBox="0 0 800 800"
        width={width}
        height={height}
        fill="currentcolor"
        data-testid="main-logo"
      >
        {
          <g>
            <path
              opacity="0.987"
              fill="#044372"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M 382.5,142.5 C 475.156,139.589 549.989,174.256 607,246.5C 621.906,266.642 633.406,288.642 641.5,312.5C 656.048,316.554 665.548,325.887 670,340.5C 675.734,364.609 667.568,382.442 645.5,394C 620.872,401.794 602.038,394.627 589,372.5C 581.862,354.63 584.362,338.296 596.5,323.5C 565.941,252.121 512.608,208.287 436.5,192C 352.693,180.37 284.193,207.203 231,272.5C 217.195,291.441 206.528,312.108 199,334.5C 191.08,348.695 179.58,352.528 164.5,346C 157.875,341.023 154.209,334.356 153.5,326C 177.89,248.272 227.557,193.272 302.5,161C 328.49,151.306 355.156,145.139 382.5,142.5 Z"
            />
          </g>
        }
        {
          <g>
            <path
              opacity="0.99"
              fill="#7bc223"
              d="M 167.5,400.5 C 199.581,403.079 214.748,420.412 213,452.5C 211.541,460.417 208.207,467.417 203,473.5C 205.257,483.251 208.924,492.585 214,501.5C 254.934,570.496 315.768,607.163 396.5,611.5C 479.093,609.642 541.593,573.642 584,503.5C 591.158,489.519 597.491,475.186 603,460.5C 611.855,450.529 622.355,448.362 634.5,454C 642.636,459.736 646.136,467.57 645,477.5C 618.192,557.634 565.359,612.8 486.5,643C 407.644,668.748 332.644,660.415 261.5,618C 212.126,585.808 177.126,541.975 156.5,486.5C 129.569,473.56 121.069,452.894 131,424.5C 138.991,410.092 151.158,402.092 167.5,400.5 Z"
            />
          </g>
        }
      </svg>
    );
  }
}

export default function LogoIcon(props) {
  const [Component = DefaultLogoIcon] = PLUGIN_LOGO_ICON_COMPONENTS;
  return <Component {...props} />;
}
