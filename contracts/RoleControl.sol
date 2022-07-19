
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./CommissionStorage.sol";
import "./ERC2771Context.sol";


pragma solidity ^0.8.0;

contract RoleControl is Initializable,   CreatorDAOCommissionStorage, ERC2771Context {

  

  function setRoot (address root) public  {
    require(_msgSender() == admin, "not an admin");

    // NOTE: Other DEFAULT_ADMIN's can remove other admins, give this role with great care
    _setupRole(DEFAULT_ADMIN_ROLE, root); 

    _setRoleAdmin(OP_ROLE, DEFAULT_ADMIN_ROLE);
  }

  // Create a bool check to see if a account address has the role admin
  function isAdmin(address account) public virtual view returns(bool)
  {
    return hasRole(DEFAULT_ADMIN_ROLE, account);
  }

  // Create a modifier that can be used in other contract to make a pre-check
  // That makes sure that the sender of the transaction (msg.sender)  is a admin
  modifier onlyAdmin() {
    require(isAdmin(_msgSender()), "Restricted to admins.");
      _; 
  }

  // Add a user address as a admin
  function addAdmin(address account) public virtual onlyAdmin
  {
    grantRole(DEFAULT_ADMIN_ROLE, account);
  }


    function isOp(address account) public virtual view returns(bool)
  {
    return hasRole(OP_ROLE, account);
  }

  // Create a modifier that can be used in other contract to make a pre-check
  // That makes sure that the sender of the transaction (msg.sender)  is a admin
  modifier onlyOp() {
    require(isOp(_msgSender()), "Restricted to OP.");
      _;
  }

  // Add a user address as a admin
  function addOp(address account) public virtual onlyAdmin
  {
    grantRole(OP_ROLE, account);
  }


  function setTrustedForwarder(address trustedForwarder) public override virtual onlyAdmin {
        _trustedForwarder = trustedForwarder;
    }

}