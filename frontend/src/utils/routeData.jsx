export const BACKEND_URL = `http://${window.location.hostname}:5000`
export const getAllVMS = async () => {
    // Call to fetch all VMs from the backend
	console.log('GETTING ALL VMS')
	try {
		const response = await fetch(`${BACKEND_URL}/vms/all`);
		const result = await response.json();
		return result
	} catch (err) {
		console.log(err);
	}
};

export const displayVMDetailData = async (vmDetails, index) => {
    // Call to fetch specific VM details from the backend
    // using the vm_id obtained from vmDetails at the given index
	console.log('GETTING VM DETAILS');
    try {
        const vms = await vmDetails;
        if (!Array.isArray(vms) || index < 0 || index >= vms.length) return null;
        const vm = vms[index]?.vm_id;
        if (!vm) return null;
        const response = await fetch(`${BACKEND_URL}/vms/${vm}`);
        if (!response.ok) {
          const text = await response.text();
          console.log('Failed to fetch VM details:', response.status, text);
          return null;
        }
        return await response.json();
    } catch (err) {
        console.log(err);
        return null;
   }
};

export const deleteVMS = async (vmDeletionList) => {
    // Call to delete VMs from the backend
    // Given a list of vm IDs to delete
	console.log("DELETING: ", vmDeletionList)
    const token = localStorage.getItem('access_token');
	try {
		for (const id of vmDeletionList) {
			console.log("DELETING: ", id)
			const response = await fetch(`${BACKEND_URL}/vms/delete/${id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
			if(response.status !== 200) return {status: 'failed'}
		}
		return {status: 'success'}
	} catch (err) {
		console.log(err)
		return {status: 'failed'}
	}
};

export const getLCData = async (vmDetails, index) => {
    // Call to fetch lifecycle data for a specific VM
    // using the vm_id obtained from vmDetails at the given index
	console.log('GETTING STATUS')
	try {
		const vms = await vmDetails
		const vm = vms[index]?.vm_id;
        if (!vm) return null;
		const response = await fetch(`${BACKEND_URL}/vms/${vm}`)
		const result = await response.json();
		return result.deployedvmstatus || null;
	} catch (err) {
		console.log(err);
	}
};

export const getPodboxData = async (vmDetails, index) => {
    // Call to fetch podbox data for a specific VM
    // using the vm_id obtained from vmDetails at the given index
  console.log('GETTING PODBOX DATA');
  try {
		const vms = await vmDetails
		const vm = vms[index]?.vm_id;
        if (!vm) return null;
		const response = await fetch(`${BACKEND_URL}/vms/${vm}`)
		const result = await response.json();
		return result.podbox || null;
  } catch (err) {
		console.log(err);
  }
};


export const getVMFromUser = async () => {
  // Call to fetch VMs associated with the current user
  console.log('GETTING VMS FROM CURRENT USER');
  try {
    const token = localStorage.getItem('access_token');
        const response = await fetch(`${BACKEND_URL}/vms_by_user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (!Array.isArray(result) || result.length === 0) return [];
    const seenIds = new Set();
    const uniqueVMs = [];
    for (const obj of result) {
      if (obj.vm_id && !seenIds.has(obj.vm_id)) {
        uniqueVMs.push(obj);
        seenIds.add(obj.vm_id);
      }
    }
    return uniqueVMs;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getVersionData = async (vmDetails, index) => {
    // Call to fetch version data for a specific VM
    // using the vm_id obtained from vmDetails at the given index
	console.log('GETTING VERSION DATA')
	try {
		const vms = await vmDetails
		const vm = vms[index].vm_id;
        if (!vm) return null;
		const response = await fetch(`${BACKEND_URL}/vms/${vm}`)
		const result = await response.json();
		return result.version;
	} catch (err) {
		console.log(err);
        return null;
	}
};

export const loginUser = async (username = null, password = null, token = null) => {
    // Call to log in user with username and password
    // taking username and password as parameters
	try {
		const response = await fetch(`${BACKEND_URL}/login`, {
			method: 'POST', headers: {
				'Content-Type': 'application/json',
			}, body: JSON.stringify({username, password})
		})
		const result = await response.json()
		return result
	} catch (err) {
		console.log(err)
		return {login_status: 'fail', error_msg: err}
	}
};

export const validateToken = async (token) => {
    // Call to validate the given token
    // taking token as parameter
	try {
		const response = await fetch(`${BACKEND_URL}/validate`, {
			method: 'POST', headers: {
				'Content-Type': 'application/json',
			}, body: JSON.stringify({token})
		})
		const result = await response.json()
		return result
	} catch (err) {
		console.log(err)
		return {validation: 'fail', error_msg: err}
	}
};

export const getUsername = async () => {
    // Call to fetch the username of the current user
    // using the stored access token
    // returns the username in uppercase or 'UNKNOWN USER' on failure
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${BACKEND_URL}/whoami`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const result = await response.json();
    console.log('Response from /whoami:', result);
    if (result.username) {
      return result.username.toUpperCase();
    }
    return 'UNKNOWN USER';
  } catch (err) {
    console.log(err);
    return 'UNKNOWN USER';
  }
};

