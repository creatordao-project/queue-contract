pragma solidity ^0.8.4;

// Import the OpenZeppelin AccessControl contract
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CommissionStorage.sol";

// create a contract that extends the OpenZeppelin AccessControl contract
contract RoleControl is Initializable,   CreatorDAOCommissionStorage, AccessControl {
  // We can create as many roles as we want
  // We use keccak256 to create a hash that identifies this constant in the contract
  bytes32 public constant OP_ROLE = keccak256("OPERATOR"); // hash a USER as a role constant

  // Constructor of the RoleControl contract
  function setRoot (address root) public  {
    require(msg.sender == admin, "not an admin");

    // NOTE: Other DEFAULT_ADMIN's can remove other admins, give this role with great care
    _setupRole(DEFAULT_ADMIN_ROLE, root); // The creator of the contract is the default admin

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
    require(isAdmin(msg.sender), "Restricted to admins.");
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
    require(isOp(msg.sender), "Restricted to OP.");
      _;
  }

  // Add a user address as a admin
  function addOp(address account) public virtual onlyAdmin
  {
    grantRole(OP_ROLE, account);
  }



}