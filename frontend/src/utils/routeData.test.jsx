import {
  getAllVMS,
  displayVMDetailData,
  deleteVMS,
  getLCData,
  getPodboxData,
  getVMFromUser,
  getVersionData,
  loginUser,
  validateToken,
  getUsername,
  BACKEND_URL // Import BACKEND_URL to use in tests
} from './routeData'; // Assuming routeData.js is the file containing your functions

describe('Global Setup', () => {


   beforeAll(() => {
     global.fetch = jest.fn();
   });

  beforeEach(() => {
    fetch.mockClear();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  // Existing tests (unchanged, but now use the mocked BACKEND_URL implicitly)

  describe('getAllVMS', () => {
    it('should fetch all VMs and return JSON data', async () => {
      const mockData = [{ id: 1, name: 'vm1' }];
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData),
      });

      const result = await getAllVMS();
      expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/vms/all`);
      expect(result).toEqual(mockData);
    });

    it('should log and return undefined on fetch error', async () => {
      fetch.mockRejectedValue(new Error('Network error'));
      const result = await getAllVMS();
      expect(console.log).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('displayVMDetailData', () => {
    it('should fetch VM detail and return result', async () => {
      const vmDetails = Promise.resolve([{ id: 42, name: 'vm42' }]);
      const mockResult = { id: 42, detail: 'info' };
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await displayVMDetailData(vmDetails, 0);
      expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/vms/lc/detail/42`);
      expect(result).toEqual(mockResult);
    });

    it('should log and return undefined on fetch error', async () => {
      const vmDetails = Promise.resolve([{ id: 99, name: 'vm99' }]);
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await displayVMDetailData(vmDetails, 0);
      expect(console.log).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('deleteVMS', () => {
   it('should call fetch for each VM in the deletion list', async () => {
      const vmDeletionList = [1, 2, 3];
      fetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      const result = await deleteVMS(vmDeletionList);

      expect(fetch).toHaveBeenCalledTimes(vmDeletionList.length);
      vmDeletionList.forEach(id => {
        expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/vms/delete/${id}`);
      });
      expect(result).toEqual({ status: 'success' });
    });

    it('should not call fetch if the deletion list is empty', async () => {
      const result = await deleteVMS([]);
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toEqual({ status: 'success' }); // Should still return success if nothing to delete
    });

    it('should log error and return failed status if fetch fails', async () => {
      fetch.mockRejectedValue(new Error('Network error'));
      const result = await deleteVMS([42]);
      expect(console.log).toHaveBeenCalled();
      expect(result).toEqual({ status: 'failed' });
    });
  });

  describe('getLCData', () => {
    it('should fetch LC data and return the first result', async () => {
      const vmDetails = Promise.resolve([{ id: 7, name: 'vm7' }]);
      const mockResult = [{ status: 'running', id: 7 }];
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await getLCData(vmDetails, 0);
      expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/vms/7`);
      expect(result).toEqual(mockResult[0]);
    });

    it('should log and return undefined on fetch error', async () => {
      const vmDetails = Promise.resolve([{ id: 8, name: 'vm8' }]);
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await getLCData(vmDetails, 0);
      expect(console.log).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  // New tests for additional functions

  describe('getPodboxData', () => {
    it('should fetch podbox data and return the first result', async () => {
      const mockId = 123;
      const mockResult = [{ podboxInfo: 'data' }];
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await getPodboxData(mockId);
      expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/vms/detail/${mockId}`);
      expect(result).toEqual(mockResult[0]);
    });

    it('should log and return undefined on fetch error', async () => {
      const mockId = 456;
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await getPodboxData(mockId);
      expect(console.log).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('getVMFromUser', () => {
    it('should fetch VMs from current user and return unique cluster IDs', async () => {
      const mockData = [
        { id: 1, deployedclusterid: 43, name: 'vmA' },
        { id: 2, deployedclusterid: 44, name: 'vmB' },
        { id: 3, deployedclusterid: 43, name: 'vmC' }, // Duplicate deployedclusterid
      ];
      const expectedResult = [
        { id: 1, deployedclusterid: 43, name: 'vmA' },
        { id: 2, deployedclusterid: 44, name: 'vmB' },
      ];
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData),
      });

      const result = await getVMFromUser();
      expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/vms_by_user`);
      expect(result).toEqual(expectedResult);
    });

    it('should return an empty array if no VMs are returned', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue([]),
      });

      const result = await getVMFromUser();
      expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/vms_by_user`);
      expect(result).toEqual([]);
    });

    it('should log and return undefined on fetch error', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await getVMFromUser();
      expect(console.log).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('getVersionData', () => {
    it('should fetch version data using deployedclusterid if available', async () => {
      const vmDetails = Promise.resolve([{ id: 10, deployedclusterid: 'clusterXYZ', name: 'vmX' }]);
      const mockResult = { message: [{ version: '1.0.0' }] };
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await getVersionData(vmDetails, 0);
      expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/vms/version/clusterXYZ`);
      expect(result).toEqual('1.0.0');
    });

    it('should fetch version data using id if deployedclusterid is not available', async () => {
      const vmDetails = Promise.resolve([{ id: 11, name: 'vmY' }]);
      const mockResult = { message: [{ version: '2.0.0' }] };
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await getVersionData(vmDetails, 0);
      expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/vms/version/11`);
      expect(result).toEqual('2.0.0');
    });

    it('should log and return undefined on fetch error', async () => {
      const vmDetails = Promise.resolve([{ id: 12, name: 'vmZ' }]);
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await getVersionData(vmDetails, 0);
      expect(console.log).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('loginUser', () => {
    it('should successfully log in with username and password', async () => {
      const mockUsername = 'testuser';
      const mockPassword = 'testpassword';
      const mockResult = { login_status: 'success', token: 'mocktoken123' };
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await loginUser(mockUsername, mockPassword);
      expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: mockUsername, password: mockPassword }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should return fail status and error message on fetch error', async () => {
      const mockError = new Error('Login failed');
      fetch.mockRejectedValue(mockError);

      const result = await loginUser('user', 'pass');
      expect(console.log).toHaveBeenCalledWith(mockError);
      expect(result).toEqual({ login_status: 'fail', error_msg: mockError });
    });
  });

  describe('validateToken', () => {
    it('should successfully validate a token', async () => {
      const mockToken = 'validtoken456';
      const mockResult = { validation: 'success', user: 'validatedUser' };
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await validateToken(mockToken);
      expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: mockToken }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should return fail status and error message on fetch error', async () => {
      const mockError = new Error('Validation failed');
      fetch.mockRejectedValue(mockError);

      const result = await validateToken('invalidtoken');
      expect(console.log).toHaveBeenCalledWith(mockError);
      expect(result).toEqual({ validation: 'fail', error_msg: mockError });
    });
  });

  describe('getUsername', () => {
    it('should fetch username and return it in uppercase', async () => {
      const mockResult = { username: 'testuser' };
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await getUsername();
      expect(fetch).toHaveBeenCalledWith(`${BACKEND_URL}/username`);
      expect(result).toEqual('TESTUSER');
    });

    it('should return UNKNOWN USER on fetch error', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await getUsername();
      expect(console.log).toHaveBeenCalled();
      expect(result).toEqual({ 'username': 'UNKNOWN USER' });
    });
  });
});