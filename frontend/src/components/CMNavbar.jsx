import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import logo from '../assets/cluster-manager-logo.svg'
import '../App.css'
import {useEffect} from "react";

function CMNavbar({handleLogout, username}) {
  useEffect(() => {

  }, []);

  return (
    <Navbar className="cm-navbar">
       <Navbar.Brand href="/"><img
              src={logo}
              width="70"
              height="30"
              className="d-inline-block align-top"
              alt="React Bootstrap logo"
            /></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Nav className="nav-user">
            <NavDropdown title={username} id="basic-nav-dropdown">
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
    </Navbar>
  );
};

export default CMNavbar;