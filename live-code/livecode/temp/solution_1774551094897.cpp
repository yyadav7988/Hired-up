#include <bits/stdc++.h>
using namespace std;

int main() {
    string line;
    getline(cin, line);

    if (line.size() <= 2) {
        cout << 0;
        return 0;
    }

    line = line.substr(1, line.size() - 2);

    vector<int> height;
    stringstream ss(line);
    string num;

    while (getline(ss, num, ',')) {
        num.erase(remove_if(num.begin(), num.end(), ::isspace), num.end());
        height.push_back(stoi(num));
    }

    int left = 0, right = height.size() - 1;
    int maxArea = 0;

    while (left < right) {
        int h = min(height[left], height[right]);
        int w = right - left;
        maxArea = max(maxArea, h * w);

        if (height[left] < height[right]) left++;
        else right--;
    }

    cout << maxArea;
    return 0;
}