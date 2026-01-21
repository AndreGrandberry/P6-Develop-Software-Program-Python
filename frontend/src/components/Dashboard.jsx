import {useEffect, useState, useCallback} from 'react'
import {
	deleteVMS, displayVMDetailData, getAllVMS, getLCData, getPodboxData, getVersionData, getVMFromUser
} from "../utils/routeData.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css'
import React from "react";
import DeleteIcon from '../assets/delete-icon.svg?react' ;
import {Table, Form, Button, Spinner, Pagination, InputGroup, Badge, Dropdown, Modal} from "react-bootstrap";


function Dashboard({username}) {
	const [allVMData, setAllVMData] = useState(null);
	const [tableData, setTableData] = useState([]);
	const [selectedClusterIds, setSelectedClusterIds] = useState(new Set());
	const displayNumber = 10;
	const [tableRange, setTableRange] = useState([0, displayNumber]);
	const [page, setPage] = useState(0);
	const [userVMData, setUserVMData] = useState(null)
	const [displayAllVMs, setDisplayAllVMs] = useState(false)
	const [currentDisplaySource, setCurrentDisplaySource] = useState(userVMData)
	const isAllSelected = tableData.length > 0 && selectedClusterIds.size === tableData.length;
	const [searchQuery, setSearchQuery] = useState('');
	const [searchCluster, setSearchCluster] = useState('')
	const [isSearchByCluster, setIsSearchByCluster] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [showDeleteStatusModal, setShowDeleteStatusModal] = useState(false)
	const [deleteStatusMessage, setDeleteStatusMessage] = useState('')

	const handleClusterCheckboxChange = useCallback((clusterId) => {
		setSelectedClusterIds(prevSelected => {
			const newSelected = new Set(prevSelected);
			if (newSelected.has(clusterId)) {
				newSelected.delete(clusterId);
			} else {
				newSelected.add(clusterId);
			}
			return newSelected;
		});
	}, []);

	const handleSelectAllCheckboxChange = useCallback((event) => {
		if (event.target.checked) {
			const allClusterIds = new Set(tableData.map(cluster => cluster.id));
			setSelectedClusterIds(allClusterIds);
		} else {
			setSelectedClusterIds(new Set());
		}
	}, [tableData]);

	const handleNextPage = useCallback(() => {
		if (currentDisplaySource && (tableRange[1] < currentDisplaySource.length)) {
			setPage(prevPage => prevPage + 1);
			setTableRange(prevRange => [prevRange[0] + displayNumber, prevRange[1] + displayNumber]);
			setSelectedClusterIds(new Set()); // Clear selection on page change
		}
	}, [currentDisplaySource, tableRange, displayNumber]);

	const handlePrevPage = useCallback(() => {
		if (page > 0) { // Check if not on the first page
			setPage(prevPage => prevPage - 1);
			setTableRange(prevRange => [prevRange[0] - displayNumber, prevRange[1] - displayNumber]);
			setSelectedClusterIds(new Set());
		}
	}, [page, displayNumber]);

	const sortAscendingIds = useCallback((vmsData) => {
		setTableData([]);
		setTableRange([0, displayNumber]);
		setPage(0);
		console.log('SORTING (Ascending)');
		const sortedVMs = vmsData.sort((a, b) => a.vm_id - b.vm_id);
		console.log('SORTED (Ascending)');
		setCurrentDisplaySource(sortedVMs);
	}, [currentDisplaySource]);

	const sortDescendingIds = useCallback((vmsData) => {
		setTableData([]);
		setTableRange([0, displayNumber]);
		setPage(0);
		console.log('SORTING (Descending)');
		const sortedVMs = vmsData.sort((a, b) => b.vm_id - a.vm_id);
		console.log('SORTED (Descending)');
		setCurrentDisplaySource(sortedVMs);
	}, [currentDisplaySource]);

	const sortAscendingUsers = useCallback((vmsData) => {
		setTableData([]);
		setTableRange([0, displayNumber]);
		setPage(0);
		console.log('SORTING (Ascending)');
		console.log(vmsData)
		const sortedVMs = vmsData.sort((a, b) => {
			return a.deployedclustername.localeCompare(b.deployedclustername)
		});
		console.log(sortedVMs)
		console.log('SORTED (Ascending)');
		setCurrentDisplaySource(sortedVMs);
	}, [currentDisplaySource]);

	const sortDescendingUsers = useCallback((vmsData) => {
		setTableData([]);
		setTableRange([0, displayNumber]);
		setPage(0);
		console.log(currentDisplaySource)
		console.log('SORTING (Ascending)');
		console.log(vmsData)
		const sortedVMs = vmsData.sort((a, b) => {
			return b.deployedclustername.localeCompare(a.deployedclustername)
		});
		console.log(sortedVMs)
		console.log('SORTED (Ascending)');
		setCurrentDisplaySource(sortedVMs);
	}, [currentDisplaySource]);

	const handleSwitchViewToggle = () => {
		setDisplayAllVMs(prevState => !prevState);
		setTableRange([0, displayNumber]);
		setPage(0)
	}

	const handleSearchCluster = (cluster) => {
		setTableData([]);
		setTableRange([0, displayNumber]);
		setPage(0);
		if (cluster.trim().length === 0) return setIsSearchByCluster(false);
		const isNumeric = /^\d+$/.test(cluster);
		if (isNumeric) {
			const filteredByID = allVMData.filter(vmData => {
				const clusterID = vmData.vm_id.toString()
				return clusterID === cluster;
			});
			setSearchCluster(filteredByID)
			setIsSearchByCluster(true)
		} else {
			const filteredByUsername = allVMData.filter(vmData => {
				const clusterName = vmData.deployedclusterowner.toLowerCase();
				const searchUsername = cluster.toLowerCase();
				return clusterName === searchUsername;
			});
			setSearchCluster(filteredByUsername)
			setIsSearchByCluster(true)
		}

	}

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault()
			handleSearchCluster(searchQuery)
		}
	}

	const handleDeleteModalClose = () => setShowDeleteModal(false);
	const handleDeleteModalOpen = () => setShowDeleteModal(true);
	const handleDeleteStatusModalOpen = () => setShowDeleteStatusModal(true);
	const handleDeleteStatusModalClose = () => setShowDeleteStatusModal(false)
	const handleDeleteVMS = async (ids) => {
		if (ids.size > 0) {
			const result = await deleteVMS(ids)
			console.log(result.status)
			if (result.status) {
				handleDeleteModalClose()
				handleDeleteStatusModalOpen()
				setDeleteStatusMessage(result.status)
			}

		}

	}

	const handlePageReload = () => {
		if (deleteStatusMessage === 'success') window.location.reload()
	}

	useEffect(() => {
		async function fetchData() {
			try {
				let userData = await getVMFromUser();
				let allVMs = await getAllVMS();
				setUserVMData(userData)
				setAllVMData(allVMs); // Set initial unsorted data
			} catch (error) {
				console.error("Error fetching initial VM data:", error);
				setAllVMData([]); // Set to empty array on error
			}
		}

		fetchData()

	}, []);

	useEffect(() => {
		let isCurrent = true; // Flag to handle race conditions for async operations
		async function fetchTableData() {

			if (displayAllVMs && !isSearchByCluster) {
				setCurrentDisplaySource(allVMData)
				setSelectedClusterIds(new Set());
				if (!allVMData || allVMData.length === 0) {
					if (isCurrent) {
						setTableData([]); // Clear table if no data or still loading allVMData
					}
					return;
				}
			} else if (!displayAllVMs) {
				setCurrentDisplaySource(userVMData)
				setSelectedClusterIds(new Set());
				if (!userVMData || userVMData.length === 0) {
					if (isCurrent) {
						setTableData([]);
					}
					return;
				}
			} else if (displayAllVMs && isSearchByCluster) {
				setCurrentDisplaySource(searchCluster)
				setSelectedClusterIds(new Set());
				if (!searchCluster || searchCluster.length === 0) {
					if (isCurrent) {
						setTableData([]);
					}
					return;
				}
			}

			// 1. Initialize tableData with basic VM info and a loading state
			setTableData([])
			const sourceData = displayAllVMs ? (isSearchByCluster ? searchCluster : allVMData) : userVMData;
			const initialTableDataSlice = sourceData.slice(tableRange[0], tableRange[1]).map(vm => ({
				id: vm.vm_id, loading: true, error: false, errorMessage: '',
			}));


			if (isCurrent) {
				setTableData(initialTableDataSlice);
			}

			// 2. Fetch details for each item in the slice and update incrementally
			for (let i = 0; i < initialTableDataSlice.length; i++) {
				if (!isCurrent) return; // Exit if a newer effect run has started

				const vm = initialTableDataSlice[i];
				const globalIndex = tableRange[0] + i;

				try {
					const vmDetails = displayAllVMs ? await displayVMDetailData(sourceData, globalIndex) : await displayVMDetailData(userVMData, globalIndex);
					const vmVersion = displayAllVMs ? await getVersionData(sourceData, globalIndex) : await getVersionData(userVMData, globalIndex);
					const vmLCData = displayAllVMs ? await getLCData(sourceData, globalIndex) : await getLCData(userVMData, globalIndex);
					const vmPodbox = displayAllVMs ? await getPodboxData(sourceData, globalIndex) : await getPodboxData(userVMData, globalIndex);
					const deployedClusterTime = new Date(vmDetails ? vmDetails?.deployedvmtimestamp : vmLCData?.deployedvmtimestamp)
					const formatDateTime = deployedClusterTime.toLocaleString()

					if (!isCurrent) return;

					const completeRowData = {
						id: vm.id,
						pod: vmPodbox || 'not found',
						version: vmVersion || 'data not found',
						deployedclusterstart: formatDateTime || 'data not found',
						deployedclusterowner: vmDetails?.deployedclusterowner,
						deployedvmstatus: vmDetails?.deployedvmstatus || 'data not found',
						loading: false,
						error: false,
						errorMessage: '',
					};

					setTableData(prevData => {
						return prevData.map(item => item.id === vm.id ? completeRowData : item);
					});

				} catch (error) {
					console.error(`Failed to fetch details for VM ID ${vm.id}:`, error);
					if (!isCurrent) return;
					setTableData(prevData => {
						return prevData.map(item => item.id === vm.id ? {
							...item, loading: false, error: true, errorMessage: error.message
						} : item);
					});
				}
			}
			console.log('TABLEDATA', tableData)
		}

		fetchTableData();

		// Cleanup function: Runs when dependencies change or component unmounts
		return () => {
			isCurrent = false; // Mark this effect run as stale
		};
	}, [allVMData, tableRange, displayVMDetailData, getLCData, displayAllVMs, isSearchByCluster, searchCluster]);

	useEffect(() => {
		console.log("Selected Cluster IDs:", selectedClusterIds);
	}, [selectedClusterIds]);

	return (<>
		<div className='dashboard-page'>
			<div className='header'><h1>Cluster Manager</h1></div>

			<div className='button-groups'>
				<div className='filters'><InputGroup className="search-bar">
					<Form.Control
						type="text"
						placeholder="Search by User or ID"
						value={searchQuery}
						onKeyDown={handleKeyDown}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="search-input w-32" // Adjust width as needed
						disabled={!displayAllVMs}
					/>
				</InputGroup>
				</div>
				<button className='delete-cluster' onClick={handleDeleteModalOpen}
				        disabled={selectedClusterIds.size === 0}>
					<DeleteIcon/><Badge className='delete-badge' pill>
					{selectedClusterIds.size}
				</Badge>
				</button>
			</div>
			<div className='cluster-table'>
				<Table hover>
					<thead>
					<tr className='table-header'>
						<Dropdown>
							<Dropdown.Toggle as='th' id="dropdown-custom-componentsc">ID</Dropdown.Toggle>

							<Dropdown.Menu>
								<Dropdown.Item eventKey='1'
								               onClick={() => sortAscendingIds(currentDisplaySource)}>Increasing</Dropdown.Item>
								<Dropdown.Item eventKey='2'
								               onClick={() => sortDescendingIds(currentDisplaySource)}>Decreasing</Dropdown.Item>
							</Dropdown.Menu></Dropdown>
						<th>POD</th>
						<th>VERSION</th>
						<th>CREATED</th>
						<Dropdown>
							<Dropdown.Toggle as='th'
							                 id="dropdown-custom-componentsc">{displayAllVMs ? 'ALL USERS' : username}</Dropdown.Toggle>

							<Dropdown.Menu>
								<Dropdown.Item eventKey='1'
								               onClick={() => handleSwitchViewToggle()}>{!displayAllVMs ? 'ALL USERS' : username}</Dropdown.Item>
								{displayAllVMs && <><Dropdown.Item eventKey='2'
								                                   onClick={() => sortAscendingUsers(allVMData)}>A-Z</Dropdown.Item>
									<Dropdown.Item eventKey='3'
									               onClick={() => sortDescendingUsers(allVMData)}>Z-A</Dropdown.Item></>}
							</Dropdown.Menu></Dropdown>
						<th>STATUS</th>
						<th className="select-header">
							SELECT
							<Form.Check
								type="checkbox"
								id="select-all-checkbox"
								checked={isAllSelected}
								onChange={handleSelectAllCheckboxChange}
								disabled={tableData.length === 0 || tableData.some(row => row.loading)} // Disable if no data or still loading
							/>
						</th>
					</tr>
					</thead>
					<tbody>
					{currentDisplaySource === null ? (<tr>
						<td rowSpan={10} colSpan={7} className="loading-message text-center">
							Loading all VM data... <Spinner animation="border" size="sm"/>
						</td>
					</tr>) : currentDisplaySource.length === 0 ? (<tr>
						<td colSpan={7} className="no-data-message text-center">
							No VMs available.
						</td>
					</tr>) : (tableData.map((rowData, index) => (
						<tr key={`${rowData.id}-${index}`} className="data-row">
							<td>{rowData.id}</td>
							{rowData.loading ? (<td colSpan={5} className="loading-details text-center">
								<Spinner animation="border" size="sm"/> Loading details...
							</td>) : rowData.error ? (<td colSpan={5} className="error-message text-center text-danger">
								Error: {rowData.errorMessage || 'Failed to load'}
							</td>) : (<>
								<td>{rowData.pod}</td>
								<td>{rowData.version}</td>
								<td>{rowData.deployedclusterstart}</td>
								<td>{rowData.deployedclusterowner}</td>
								<td>{rowData.deployedvmstatus}</td>
							</>)}
							<td>
								{rowData.loading || rowData.error ? null : (<Form.Check
									type="checkbox"
									id={`cluster-id-${rowData.id}`}
									checked={selectedClusterIds.has(rowData.id)}
									onChange={() => handleClusterCheckboxChange(rowData.id)}
									className="select-checkbox"
								/>)}
							</td>
						</tr>)))}
					</tbody>
				</Table>
			</div>
			<div className="pagination-info">
				{currentDisplaySource && currentDisplaySource.length > 0 ? (
						<p>Showing {tableRange[0] + 1} - {tableRange[1] > currentDisplaySource?.length ? tableData?.length : tableRange[1]} of {currentDisplaySource?.length}</p>) :
					<p>{''}</p>}
				<Pagination className="pagination-controls">
					<Pagination.Prev onClick={handlePrevPage} disabled={page === 0}/>
					<Pagination.Next onClick={handleNextPage}
					                 disabled={currentDisplaySource && (tableRange[1] >= currentDisplaySource.length)}/>
				</Pagination>
			</div>
		</div>
		<Modal
			show={showDeleteModal}
			onHide={handleDeleteModalClose}
			backdrop="static"
			keyboard={false}
		>
			<Modal.Header closeButton>
				<Modal.Title>Delete Clusters</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				Are you sure you want to delete {selectedClusterIds.size} cluster(s)?
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleDeleteModalClose}>
					No
				</Button>
				<Button variant="danger" className='delete-cluster'
				        onClick={() => handleDeleteVMS(selectedClusterIds)}>Yes, Delete</Button>
			</Modal.Footer>
		</Modal>
		<Modal
			show={showDeleteStatusModal}
			onHide={handleDeleteStatusModalClose}
			onExit={handlePageReload}
			backdrop="static"
			keyboard={false}
		>
			<Modal.Header closeButton>
				<Modal.Title>{deleteStatusMessage === 'success' ? 'SUCCESS' : 'DELETION DENIED'}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{deleteStatusMessage === 'success' ? 'Cluster(s) successfully deleted' : 'Unable to delete cluster(s)'}
			</Modal.Body>
			<Modal.Footer>

			</Modal.Footer>
		</Modal>
	</>);
}

export default Dashboard;