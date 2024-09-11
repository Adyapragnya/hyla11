import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";
import './style.css';
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarDesktopMenu,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";
import {
  useArgonController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";
import team2 from "assets/images/team-2.jpg";
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";

function DashboardNavbar({ absolute, light, isMini, showButton, dropdownOptions }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useArgonController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [dropdownAnchorEl, setDropdownAnchorEl] = useState(null);
  const [isGlobal, setIsGlobal] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const route = useLocation().pathname.split("/").slice(1);

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  useEffect(() => {
    setFilteredOptions(
      dropdownOptions.filter(option =>
        option.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, dropdownOptions]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(null);

  const handleDropdownClick = (event) => {
    setDropdownAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setDropdownAnchorEl(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem
        image={<img src={team2} alt="person" />}
        title={["New message", "from Laur"]}
        date="13 minutes ago"
        onClick={handleCloseMenu}
      />
      <NotificationItem
        image={<img src={logoSpotify} alt="person" />}
        title={["New album", "by Travis Scott"]}
        date="1 day"
        onClick={handleCloseMenu}
      />
      <NotificationItem
        color="secondary"
        image={<Icon fontSize="small" sx={{ color: ({ palette: { white } }) => white.main }}>payment</Icon>}
        title={["", "Payment successfully completed"]}
        date="2 days"
        onClick={handleCloseMenu}
      />
    </Menu>
  );

  const renderDropdown = () => (
    <Menu
      anchorEl={dropdownAnchorEl}
      anchorReference="anchorEl"
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={Boolean(dropdownAnchorEl)}
      onClose={handleDropdownClose}
      sx={{ mt: 2, padding: 2, minWidth: 200 }}  // Add padding and minWidth for better layout
    >
      <MenuItem>
        <ArgonInput 
          placeholder="Search..." 
          fullWidth 
       
          onChange={handleSearchChange}
          value={searchTerm}
        />
      </MenuItem>

      {/* Dropdown options from props */}
      {filteredOptions.length ? (
        filteredOptions.map((option, index) => (
          <MenuItem key={index} onClick={() => {
            // Handle option selection if needed
            handleDropdownClose();
          }}>
            {option}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>No options available</MenuItem>
      )}
    </Menu>
  );

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light })}
      style={{ marginTop: '-30px' }}
    >
      <Toolbar sx={(theme) => navbarContainer(theme, { navbarType })}>
        <ArgonBox
          color={light && transparentNavbar ? "white" : "dark"}
          mb={{ xs: 1, md: 0 }}
          sx={(theme) => navbarRow(theme, { isMini })}
        >
          <Breadcrumbs
            icon="home"
            title={route[route.length - 1]}
            route={route}
            light={transparentNavbar ? light : false}
          />
          <Icon fontSize="medium" sx={navbarDesktopMenu} onClick={handleMiniSidenav}>
            {miniSidenav ? "menu_open" : "menu"}
          </Icon>
        </ArgonBox>

        {isMini ? null : (
          <ArgonBox sx={(theme) => navbarRow(theme, { isMini })}>
            <ArgonBox color={light ? "white" : "inherit"} display="flex" alignItems="center">


              {/* {showButton && (
                <label className="switch">
                  <input type="checkbox" checked={!isGlobal} onChange={() => setIsGlobal(!isGlobal)} />
                  <span className="slider"></span>
                </label>
              )}
             
              {!isGlobal && (
                <IconButton
                  size="small"
                  color={light && transparentNavbar ? "white" : "dark"}
                  sx={navbarIconButton}
                  onClick={handleDropdownClick}  // This triggers the dropdown
                >
                  <ArgonInput 
                    placeholder="Search and select..." 
                    readOnly 
                    value={searchTerm} 
                    sx={{ borderRadius: 1, borderColor: 'grey.500', minWidth: 200 }} // Styling the input
                  />
                  <Icon>arrow_drop_down</Icon>
                </IconButton>
              )} */}

              {/* <Link to="/authentication/sign-in/basic">
                <IconButton sx={navbarIconButton} size="small">
                  <Icon
                    sx={({ palette: { dark, white } }) => ({
                      color: light && transparentNavbar ? white.main : dark.main,
                    })}
                  >
                    account_circle
                  </Icon>
                  <ArgonTypography
                    variant="button"
                    fontWeight="medium"
                    color={light && transparentNavbar ? "white" : "dark"}
                  >
                    Sign in
                  </ArgonTypography>
                </IconButton>
              </Link> */}

              <IconButton
                size="small"
                color={light && transparentNavbar ? "white" : "dark"}
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon>{miniSidenav ? "menu_open" : "menu"}</Icon>
              </IconButton>
              <IconButton
                size="small"
                color={light && transparentNavbar ? "white" : "dark"}
                sx={navbarIconButton}
                onClick={handleConfiguratorOpen}
              >
                <Icon>settings</Icon>
              </IconButton>
              <IconButton
                size="small"
                color={light && transparentNavbar ? "white" : "dark"}
                sx={navbarIconButton}
                aria-controls="notification-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={handleOpenMenu}
              >
                <Icon>notifications</Icon>
              </IconButton>
            </ArgonBox>
          </ArgonBox>
        )}
      </Toolbar>
      {renderDropdown()}
      {renderMenu()}
    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: true,
  isMini: false,
  showButton: false,
  dropdownOptions: [],
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  showButton: PropTypes.bool,
  dropdownOptions: PropTypes.arrayOf(PropTypes.string),
};

export default DashboardNavbar;
