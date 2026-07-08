// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TimeCapsule {
    struct Capsule {
        uint256 id;
        address owner;
        string ipfsHash;
        uint256 unlockTime;
        bool isOpened;
    }

    mapping(uint256 => Capsule) public capsules;
    mapping(address => uint256[]) public userCapsules;
    uint256 public nextCapsuleId;

    event CapsuleCreated(uint256 indexed id, address indexed owner, uint256 unlockTime);
    event CapsuleOpened(uint256 indexed id, address indexed owner);

    function createCapsule(string calldata ipfsHash, uint256 unlockTime) external returns (uint256) {
        require(unlockTime > block.timestamp, unicode"개봉 시점이 현재보다 미래여야 합니다");

        uint256 capsuleId = nextCapsuleId;
        capsules[capsuleId] = Capsule({
            id: capsuleId,
            owner: msg.sender,
            ipfsHash: ipfsHash,
            unlockTime: unlockTime,
            isOpened: false
        });
        userCapsules[msg.sender].push(capsuleId);
        nextCapsuleId++;

        emit CapsuleCreated(capsuleId, msg.sender, unlockTime);
        return capsuleId;
    }

    function openCapsule(uint256 capsuleId) external {
        Capsule storage capsule = capsules[capsuleId];

        require(capsule.owner == msg.sender, unicode"캡슐 소유자만 개봉할 수 있습니다");
        require(block.timestamp >= capsule.unlockTime, unicode"개봉 시점이 도래하지 않았습니다");
        require(!capsule.isOpened, unicode"이미 개봉된 캡슐입니다");

        capsule.isOpened = true;

        emit CapsuleOpened(capsuleId, msg.sender);
    }

    function getMyCapsules() external view returns (Capsule[] memory) {
        uint256[] memory ids = userCapsules[msg.sender];
        Capsule[] memory result = new Capsule[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = capsules[ids[i]];
        }

        return result;
    }

    function getCapsule(uint256 capsuleId) external view returns (Capsule memory) {
        return capsules[capsuleId];
    }
}
