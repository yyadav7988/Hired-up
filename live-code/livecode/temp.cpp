#include <bits/stdc++.h>
using namespace std;

int main() {
    string line;
    
    // Read array line
    getline(cin, line); // e.g. [2,7,11,15]
    
    // Remove brackets
    line = line.substr(1, line.size() - 2);

    vector<int> nums;
    stringstream ss(line);
    string num;

    // Parse numbers
    while (getline(ss, num, ',')) {
        nums.push_back(stoi(num));
    }

    // Read target
    int target;
    cin >> target;

    unordered_map<int, int> mp;

    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];

        if (mp.find(complement) != mp.end()) {
            cout << "[" << mp[complement] << "," << i << "]";
            return 0;
        }

        mp[nums[i]] = i;
    }

    return 0;
}