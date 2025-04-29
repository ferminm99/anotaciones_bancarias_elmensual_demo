import React, { useState } from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Icono de cuenta
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Box } from "@mui/material";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const ModernSidebar: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
  };

  // Manejador de apertura y cierre de menú de cuenta
  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Elimina el token del almacenamiento
    window.location.href = "/login"; // Redirige al login
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ marginRight: 5, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Panel de Control
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleAccountClick}
            aria-controls="account-menu"
            aria-haspopup="true"
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleAccountClose}
          >
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon sx={{ fontSize: 40 }} />
            ) : (
              <ChevronLeftIcon sx={{ fontSize: 40 }} />
            )}
          </IconButton>
        </div>
        <List sx={{ marginTop: 2 }}>
          <ListItem
            component="a"
            href="/"
            onClick={() => handleListItemClick(0)}
            sx={{
              "&:hover": {
                backgroundColor: "lightgray",
              },
              backgroundColor: selectedIndex === 0 ? "lightgray" : "inherit",
            }}
          >
            <ListItemText primary="Transacciones" />
          </ListItem>
          <ListItem
            component="a"
            href="/clients"
            onClick={() => handleListItemClick(1)}
            sx={{
              "&:hover": {
                backgroundColor: "lightgray",
              },
              backgroundColor: selectedIndex === 1 ? "lightgray" : "inherit",
            }}
          >
            <ListItemText primary="Clientes" />
          </ListItem>
          <ListItem
            component="a"
            href="/banks"
            onClick={() => handleListItemClick(2)}
            sx={{
              "&:hover": {
                backgroundColor: "lightgray",
              },
              backgroundColor: selectedIndex === 2 ? "lightgray" : "inherit",
            }}
          >
            <ListItemText primary="Bancos" />
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default ModernSidebar;
