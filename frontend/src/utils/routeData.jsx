export const BACKEND_URL = `http://${window.location.hostname}:5000`
export const getAllVMS = async () => {
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
    return 'bobby';
  }
};

